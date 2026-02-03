import { Inject, Injectable } from '@nestjs/common';
import { ResultAsync, okAsync, errAsync } from 'neverthrow';
import { IEscrowService } from './escrow.service.interface';
import { IWalletService } from './wallet.service.interface';
import { IEscrowRepository } from '../repository/escrow.repository.interface';
import { EscrowHold } from '../models/escrow-hold.model';
import { WALLET_SERVICE } from '../tokens/payment.token';
import { ESCROW_REPOSITORY } from 'src/database/typeorm/tokens/database.token';
import {
  createDomainError,
  DomainError,
} from 'src/shared/types/domain-error.type';
import { PAYMENT_ERRORS } from '../errors/payment.errors';
import { CUSTOM_LOG } from 'src/shared/custom-loggers/tokens/custom-logger.token';
import { ICustomLoggerService } from 'src/shared/custom-loggers/interfaces/custom-logger.service.interface';
import { WithPosition } from 'src/common/decorators/with-position.decorator';

@Injectable()
export class EscrowService implements IEscrowService {
  constructor(
    @Inject(ESCROW_REPOSITORY)
    private readonly escrowRepository: IEscrowRepository,
    @Inject(WALLET_SERVICE)
    private readonly walletService: IWalletService,
    @Inject(CUSTOM_LOG)
    private readonly logger: ICustomLoggerService,
  ) {}

  @WithPosition()
  createHold(
    orderId: string,
    shopId: string,
    amount: number,
    orderSubtotal: number,
    shippingFee: number,
    coinUsed: number,
    platformFeePercent: number,
  ): ResultAsync<EscrowHold, DomainError> {
    const escrowHold = EscrowHold.create({
      orderId,
      shopId,
      amount,
      orderSubtotal,
      shippingFee,
      coinUsed,
      platformFeePercent,
    });

    return this.escrowRepository.createHold(escrowHold);
  }

  @WithPosition()
  findByOrderId(orderId: string): ResultAsync<EscrowHold[], DomainError> {
    return this.escrowRepository.findByOrderId(orderId);
  }

  /**
   * Release escrow to shop.
   * NOTE: This method does NOT create its own transaction.
   * Caller must wrap this in a UoW transaction (e.g., from confirmDelivery).
   *
   * Operations:
   * - Update escrow status → RELEASED
   * - Credit shop wallet
   * - Credit/Debit platform wallet (fee)
   */
  @WithPosition()
  releaseToShop(escrowId: string): ResultAsync<void, DomainError> {
    return this.escrowRepository.findById(escrowId).andThen((escrowHold) => {
      if (!escrowHold) {
        return errAsync(
          createDomainError(PAYMENT_ERRORS.ESCROW_NOT_FOUND, { cause: null }),
        );
      }

      const releaseResult = escrowHold.release();
      if (releaseResult.isErr()) {
        return errAsync(releaseResult.error);
      }

      // Calculate amounts using stored values from order creation time
      // platformFee is calculated on orderSubtotal (original value before coin discount)
      const platformFee = Math.round(
        escrowHold.orderSubtotal * (escrowHold.platformFeePercent / 100),
      );
      // Shop receives: orderSubtotal - platformFee + shippingFee
      const shopReceives = escrowHold.orderSubtotal - platformFee + escrowHold.shippingFee;
      // Platform receives: escrowAmount - shopReceives
      // = platformFee - platformShipDiscount - coinUsed
      // Can be negative if (platformShipDiscount + coinUsed) > platformFee
      const platformReceives = escrowHold.amount - shopReceives;

      this.logger.log(
        `Releasing escrow ${escrowId}: escrowAmount=${escrowHold.amount}, orderSubtotal=${escrowHold.orderSubtotal}, shippingFee=${escrowHold.shippingFee}, coinUsed=${escrowHold.coinUsed}, feePercent=${escrowHold.platformFeePercent}%, platformFee=${platformFee}, shopReceives=${shopReceives}, platformReceives=${platformReceives}`,
        'EscrowService',
      );

      // Update escrow status
      return (
        this.escrowRepository
          .updateHold(escrowHold)
          // Credit shop wallet
          .andThen(() =>
            this.walletService.creditShopFromEscrow(
              escrowHold.shopId,
              escrowHold.orderId,
              shopReceives,
            ),
          )
          // Credit or debit platform wallet
          .andThen(() => {
            if (platformReceives > 0) {
              // Platform receives fee
              return this.walletService.creditPlatformFromEscrow(
                escrowHold.orderId,
                platformReceives,
              );
            } else if (platformReceives < 0) {
              // Platform subsidizes shop (coinUsed > platformFee)
              return this.walletService.debitPlatformForEscrow(
                escrowHold.orderId,
                Math.abs(platformReceives),
              );
            }
            // platformReceives === 0, no platform transaction needed
            return okAsync(undefined as any);
          })
          .map(() => undefined)
      );
    });
  }

  @WithPosition()
  refundToBuyer(
    escrowId: string,
    buyerId: string,
  ): ResultAsync<void, DomainError> {
    // NOTE: This method is always called within an existing transaction (from cancelMyOrder/cancelShopOrder)
    // Do NOT wrap in executeInTransaction to avoid nested transaction issues
    return this.escrowRepository.findById(escrowId).andThen((escrowHold) => {
      if (!escrowHold) {
        return errAsync(
          createDomainError(PAYMENT_ERRORS.ESCROW_NOT_FOUND, { cause: null }),
        );
      }

      const refundResult = escrowHold.refund();
      if (refundResult.isErr()) {
        return errAsync(refundResult.error);
      }

      // Update escrow and credit buyer wallet with transaction record
      // Both operations run in the caller's transaction
      return this.escrowRepository
        .updateHold(escrowHold)
        .andThen(() =>
          this.walletService.creditBuyerFromEscrowRefund(
            buyerId,
            escrowHold.orderId,
            escrowHold.amount,
          ),
        )
        .map(() => undefined);
    });
  }
}

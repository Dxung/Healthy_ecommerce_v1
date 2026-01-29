import { Inject, Injectable } from '@nestjs/common';
import { ResultAsync, okAsync, errAsync } from 'neverthrow';
import { IEscrowService } from './escrow.service.interface';
import { IWalletService } from './wallet.service.interface';
import { IEscrowRepository } from '../repository/escrow.repository.interface';
import { IWalletRepository } from '../repository/wallet.repository.interface';
import { EscrowHold } from '../models/escrow-hold.model';
import { PendingRelease } from '../models/pending-release.model';
import { WalletOwnerType } from 'src/database/typeorm/entities/payment/enums/wallet-owner-type.enum';
import { WALLET_SERVICE } from '../tokens/payment.token';
import {
  ESCROW_REPOSITORY,
  WALLET_REPOSITORY,
} from 'src/database/typeorm/tokens/database.token';
import {
  createDomainError,
  DomainError,
} from 'src/shared/types/domain-error.type';
import { PAYMENT_ERRORS } from '../errors/payment.errors';
import { CUSTOM_LOG } from 'src/shared/custom-loggers/tokens/custom-logger.token';
import { ICustomLoggerService } from 'src/shared/custom-loggers/interfaces/custom-logger.service.interface';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import { IShopBadgeBenefitsService } from 'src/modules/shop/shop-badge-benefits.service.interface';
import { SHOP_BADGE_BENEFITS_SERVICE } from 'src/modules/shop/tokens/shop.token';
import { ISystemConfigService } from 'src/modules/system-config/system-config.service.interface';
import { SYSTEM_CONFIG_SERVICE } from 'src/modules/system-config/tokens/system-config.token';

@Injectable()
export class EscrowService implements IEscrowService {
  constructor(
    @Inject(ESCROW_REPOSITORY)
    private readonly escrowRepository: IEscrowRepository,
    @Inject(WALLET_REPOSITORY)
    private readonly walletRepository: IWalletRepository,
    @Inject(WALLET_SERVICE)
    private readonly walletService: IWalletService,
    @Inject(CUSTOM_LOG)
    private readonly logger: ICustomLoggerService,
    @Inject(SHOP_BADGE_BENEFITS_SERVICE)
    private readonly badgeBenefitsService: IShopBadgeBenefitsService,
    @Inject(SYSTEM_CONFIG_SERVICE)
    private readonly systemConfigService: ISystemConfigService,
  ) {}

  @WithPosition()
  createHold(
    orderId: string,
    shopId: string,
    amount: number,
  ): ResultAsync<EscrowHold, DomainError> {
    const escrowHold = EscrowHold.create({
      orderId,
      shopId,
      amount,
    });

    return this.escrowRepository.createHold(escrowHold);
  }

  @WithPosition()
  findByOrderId(orderId: string): ResultAsync<EscrowHold[], DomainError> {
    return this.escrowRepository.findByOrderId(orderId);
  }

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

      // Get platform fee rate and badge discount
      return ResultAsync.combine([
        this.systemConfigService.getPlatformFeePercent(),
        this.badgeBenefitsService.getEffectivePlatformFeeDiscount(
          escrowHold.shopId,
        ),
      ]).andThen(([baseFeePercent, badgeDiscount]) => {
        // Calculate effective platform fee with badge discount
        // effectiveFeePercent = baseFeePercent * (1 - badgeDiscount/100)
        const effectiveFeePercent = baseFeePercent * (1 - badgeDiscount / 100);
        const platformFee = Math.round(
          escrowHold.amount * (effectiveFeePercent / 100),
        );
        const netAmount = escrowHold.amount - platformFee;

        this.logger.log(
          `Releasing escrow ${escrowId}: amount=${escrowHold.amount}, baseFee=${baseFeePercent}%, badgeDiscount=${badgeDiscount}%, effectiveFee=${effectiveFeePercent}%, platformFee=${platformFee}, netToShop=${netAmount}`,
          'EscrowService',
        );

        // Update escrow and credit shop wallet with net amount
        return this.escrowRepository
          .updateHold(escrowHold)
          .andThen(() =>
            this.walletService.creditShopFromEscrow(
              escrowHold.shopId,
              escrowHold.orderId,
              netAmount,
            ),
          )
          .map(() => undefined);
      });
    });
  }

  @WithPosition()
  refundToBuyer(
    escrowId: string,
    buyerId: string,
  ): ResultAsync<void, DomainError> {
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

      // Update escrow and credit buyer wallet
      return this.escrowRepository
        .updateHold(escrowHold)
        .andThen(() =>
          this.walletRepository.findByOwner(WalletOwnerType.BUYER, buyerId),
        )
        .andThen((wallet) => {
          if (!wallet) {
            return errAsync(
              createDomainError(PAYMENT_ERRORS.WALLET_NOT_FOUND, {
                cause: null,
              }),
            );
          }

          wallet.credit(escrowHold.amount);
          return this.walletRepository.saveWallet(wallet);
        })
        .map(() => undefined);
    });
  }

  @WithPosition()
  createPendingRelease(
    escrowHold: EscrowHold,
    shopId: string,
  ): ResultAsync<PendingRelease, DomainError> {
    return this.walletRepository
      .findOrCreateForShop(shopId)
      .andThen((shopWallet) => {
        const pendingRelease = PendingRelease.create({
          escrowHoldId: escrowHold.id,
          shopWalletId: shopWallet.id,
          amount: escrowHold.amount,
        });

        return this.escrowRepository.createPendingRelease(pendingRelease);
      });
  }

  @WithPosition()
  processCompletedOrderReleases(): ResultAsync<number, DomainError> {
    return this.escrowRepository
      .findHoldingEscrowsForCompletedOrders()
      .andThen((escrowsWithShops) => {
        if (escrowsWithShops.length === 0) {
          return okAsync(0);
        }

        // Create pending releases for each escrow
        const createReleases = escrowsWithShops.map(({ escrowHold, shopId }) =>
          this.createPendingRelease(escrowHold, shopId),
        );

        return ResultAsync.combine(createReleases).map(
          (releases) => releases.length,
        );
      });
  }

  @WithPosition()
  processPendingReleasesWithRetry(): ResultAsync<number, DomainError> {
    return this.escrowRepository
      .findPendingReleasesForProcessing()
      .andThen((pendingReleases) => {
        if (pendingReleases.length === 0) {
          return okAsync(0);
        }

        let processedCount = 0;

        const processRelease = (
          release: PendingRelease,
        ): ResultAsync<void, never> => {
          release.startProcessing();

          return this.escrowRepository
            .updatePendingRelease(release)
            .andThen(() => this.escrowRepository.findById(release.escrowHoldId))
            .andThen((escrowHold) => {
              if (!escrowHold || !escrowHold.isHolding()) {
                release.complete();
                return this.escrowRepository.updatePendingRelease(release);
              }

              return this.releaseToShop(escrowHold.id)
                .andThen(() => {
                  release.complete();
                  processedCount++;
                  return this.escrowRepository.updatePendingRelease(release);
                })
                .orElse((error) => {
                  release.fail(error.message);
                  this.logger.warn(
                    `Failed to release escrow ${escrowHold.id}: ${error.message}`,
                    'EscrowService',
                  );
                  return this.escrowRepository.updatePendingRelease(release);
                });
            })
            .orElse((error) => {
              release.fail(error.message);
              this.logger.error(
                `Error processing pending release ${release.id}: ${error.message}`,
                'EscrowService',
              );
              return this.escrowRepository
                .updatePendingRelease(release)
                .map(() => undefined)
                .orElse(() => okAsync(undefined));
            })
            .map(() => undefined);
        };

        // Process releases sequentially to avoid race conditions
        return pendingReleases
          .reduce(
            (chain, release) => chain.andThen(() => processRelease(release)),
            okAsync(undefined) as ResultAsync<void, never>,
          )
          .map(() => processedCount);
      });
  }

  @WithPosition()
  retryFailedRelease(pendingReleaseId: string): ResultAsync<void, DomainError> {
    return this.escrowRepository
      .findPendingReleaseById(pendingReleaseId)
      .andThen((release) => {
        if (!release) {
          return errAsync(
            createDomainError(PAYMENT_ERRORS.PENDING_RELEASE_NOT_FOUND, {
              cause: null,
            }),
          );
        }

        if (!release.isFailed()) {
          return errAsync(
            createDomainError(PAYMENT_ERRORS.PENDING_RELEASE_NOT_FAILED, {
              cause: null,
            }),
          );
        }

        release.resetForRetry();
        return this.escrowRepository.updatePendingRelease(release);
      })
      .map(() => undefined);
  }
}

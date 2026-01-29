import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { ResultAsync, okAsync, errAsync } from 'neverthrow';
import {
  IPaymentService,
  CreateOrderPaymentResult,
  VnpayReturnHandlerResult,
} from './payment.service.interface';
import {
  IVnpayService,
  VnpayReturnQuery,
} from './services/vnpay.service.interface';
import { IWalletService } from './services/wallet.service.interface';
import { IPaymentTransactionRepository } from './repository/payment-transaction.repository.interface';
import { IOrderService } from '../order/order.service.interface';
import { VNPAY_SERVICE, WALLET_SERVICE } from './tokens/payment.token';
import { PAYMENT_TRANSACTION_REPOSITORY } from 'src/database/typeorm/tokens/database.token';
import { ORDER_SERVICE } from '../order/tokens/order.token';
import { PaymentTransaction } from './models/payment-transaction.model';
import { PaymentType } from 'src/database/typeorm/entities/payment/enums/payment-type.enum';
import {
  createDomainError,
  DomainError,
} from 'src/shared/types/domain-error.type';
import { PAYMENT_ERRORS } from './errors/payment.errors';
import { WithPosition } from 'src/common/decorators/with-position.decorator';

/**
 * PaymentService - High-level payment orchestration
 *
 * Responsibilities:
 * - Create payment transactions for orders
 * - Handle VNPay callbacks (return URL & IPN)
 * - Coordinate between VnpayService, WalletService, and OrderService
 *
 * Note: Escrow creation is handled by OrderService.processVnpayPaymentSuccess()
 * to keep order-related business logic within the Order module.
 */
@Injectable()
export class PaymentService implements IPaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @Inject(VNPAY_SERVICE)
    private readonly vnpayService: IVnpayService,
    @Inject(WALLET_SERVICE)
    private readonly walletService: IWalletService,
    @Inject(PAYMENT_TRANSACTION_REPOSITORY)
    private readonly paymentTransactionRepository: IPaymentTransactionRepository,
    @Inject(forwardRef(() => ORDER_SERVICE))
    private readonly orderService: IOrderService,
  ) {}

  @WithPosition()
  createOrderPayment(
    orderId: string,
    amount: number,
    ipAddress: string,
  ): ResultAsync<CreateOrderPaymentResult, DomainError> {
    const paymentTxn = PaymentTransaction.createForOrder({
      orderId,
      amount,
    });

    return this.paymentTransactionRepository
      .create(paymentTxn)
      .andThen((savedTxn) =>
        this.vnpayService
          .createPaymentUrl({
            amount,
            orderInfo: `Thanh toan don hang ${orderId.substring(0, 8)}`,
            orderId,
            ipAddress,
            txnRef: savedTxn.vnpayTxnRef,
          })
          .map((vnpayResult) => ({
            paymentUrl: vnpayResult.paymentUrl,
            txnRef: savedTxn.vnpayTxnRef,
            transactionId: savedTxn.id,
          })),
      );
  }

  @WithPosition()
  handleVnpayReturn(
    query: VnpayReturnQuery,
  ): ResultAsync<VnpayReturnHandlerResult, DomainError> {
    this.logger.log(
      `VNPay return received: txnRef=${query.vnp_TxnRef}, responseCode=${query.vnp_ResponseCode}`,
    );

    return this.vnpayService.verifyReturnUrl(query).andThen((verifyResult) =>
      this.paymentTransactionRepository
        .findByTxnRef(verifyResult.txnRef)
        .andThen((transaction) => {
          if (!transaction) {
            this.logger.error(
              `Payment transaction not found: ${verifyResult.txnRef}`,
            );
            return errAsync(
              createDomainError(PAYMENT_ERRORS.TRANSACTION_NOT_FOUND, {
                cause: `Transaction not found: ${verifyResult.txnRef}`,
              }),
            );
          }

          if (verifyResult.isSuccess) {
            return this.processSuccessfulPayment(
              transaction,
              verifyResult.transactionNo || '',
              verifyResult.bankCode,
              verifyResult.amount,
            );
          } else {
            return this.processFailedPayment(
              transaction,
              verifyResult.responseCode,
            );
          }
        }),
    );
  }

  @WithPosition()
  handleVnpayIpn(
    query: VnpayReturnQuery,
  ): ResultAsync<{ RspCode: string; Message: string }, DomainError> {
    this.logger.log(
      `VNPay IPN received: txnRef=${query.vnp_TxnRef}, responseCode=${query.vnp_ResponseCode}`,
    );

    return this.vnpayService.verifyIpn(query).andThen((verifyResult) =>
      this.paymentTransactionRepository
        .findByTxnRef(verifyResult.txnRef)
        .andThen((transaction) => {
          if (!transaction) {
            this.logger.error(
              `Payment transaction not found: ${verifyResult.txnRef}`,
            );
            return okAsync({ RspCode: '02', Message: 'Order not found' });
          }

          if (verifyResult.isSuccess) {
            return this.processSuccessfulPaymentIpn(
              transaction,
              verifyResult.transactionNo || '',
              verifyResult.bankCode,
              verifyResult.amount,
            );
          } else {
            return this.processFailedPaymentIpn(transaction);
          }
        }),
    );
  }

  /**
   * Process successful payment (for return URL)
   */
  private processSuccessfulPayment(
    transaction: PaymentTransaction,
    transactionNo: string,
    bankCode: string | undefined,
    amount: number,
  ): ResultAsync<VnpayReturnHandlerResult, DomainError> {
    // Mark transaction as success
    transaction.markSuccess({
      transactionNo,
      responseCode: '00',
      bankCode,
    });

    return this.paymentTransactionRepository.save(transaction).andThen(() => {
      if (transaction.type === PaymentType.TOPUP) {
        return this.walletService
          .processTopupSuccess(
            transaction.vnpayTxnRef,
            amount,
            transactionNo,
            bankCode || '',
          )
          .map(
            (): VnpayReturnHandlerResult => ({
              isSuccess: true,
              type: 'topup',
              amount,
              redirectPath: '/user/wallet',
              redirectParams: { status: 'success', amount: amount.toString() },
            }),
          );
      } else if (
        transaction.type === PaymentType.ORDER_PAYMENT &&
        transaction.orderId
      ) {
        return this.orderService
          .processVnpayPaymentSuccess(transaction.orderId)
          .map(
            (): VnpayReturnHandlerResult => ({
              isSuccess: true,
              type: 'order_payment',
              amount,
              redirectPath: '/checkout/success',
              redirectParams: { status: 'success' },
            }),
          );
      }

      return errAsync(
        createDomainError(PAYMENT_ERRORS.INVALID_TRANSACTION_TYPE, {
          cause: `Unknown transaction type: ${transaction.type}`,
        }),
      );
    });
  }

  /**
   * Process failed payment (for return URL)
   */
  private processFailedPayment(
    transaction: PaymentTransaction,
    responseCode: string,
  ): ResultAsync<VnpayReturnHandlerResult, DomainError> {
    transaction.markFailed({ responseCode });

    return this.paymentTransactionRepository.save(transaction).andThen(() => {
      if (transaction.type === PaymentType.TOPUP) {
        return this.walletService
          .processTopupFailed(transaction.vnpayTxnRef)
          .map(
            (): VnpayReturnHandlerResult => ({
              isSuccess: false,
              type: 'topup',
              amount: transaction.amount,
              redirectPath: '/user/wallet',
              redirectParams: { status: 'failed', code: responseCode },
            }),
          );
      } else if (
        transaction.type === PaymentType.ORDER_PAYMENT &&
        transaction.orderId
      ) {
        return this.orderService
          .processVnpayPaymentFailed(transaction.orderId)
          .map(
            (): VnpayReturnHandlerResult => ({
              isSuccess: false,
              type: 'order_payment',
              amount: transaction.amount,
              redirectPath: '/checkout',
              redirectParams: { status: 'failed', code: responseCode },
            }),
          );
      }

      return okAsync<VnpayReturnHandlerResult, DomainError>({
        isSuccess: false,
        type: 'topup',
        amount: transaction.amount,
        redirectPath: '/user/wallet',
        redirectParams: { status: 'error' },
      });
    });
  }

  /**
   * Process successful payment for IPN
   */
  private processSuccessfulPaymentIpn(
    transaction: PaymentTransaction,
    transactionNo: string,
    bankCode: string | undefined,
    amount: number,
  ): ResultAsync<{ RspCode: string; Message: string }, DomainError> {
    transaction.markSuccess({
      transactionNo,
      responseCode: '00',
      bankCode,
    });

    return this.paymentTransactionRepository.save(transaction).andThen(() => {
      if (transaction.type === PaymentType.TOPUP) {
        return this.walletService
          .processTopupSuccess(
            transaction.vnpayTxnRef,
            amount,
            transactionNo,
            bankCode || '',
          )
          .map(() => ({ RspCode: '00', Message: 'Confirm Success' }))
          .orElse(() =>
            okAsync({ RspCode: '02', Message: 'Processing failed' }),
          );
      } else if (
        transaction.type === PaymentType.ORDER_PAYMENT &&
        transaction.orderId
      ) {
        return this.orderService
          .processVnpayPaymentSuccess(transaction.orderId)
          .map(() => ({ RspCode: '00', Message: 'Confirm Success' }))
          .orElse(() =>
            okAsync({ RspCode: '02', Message: 'Processing failed' }),
          );
      }

      return okAsync({ RspCode: '00', Message: 'Confirm Success' });
    });
  }

  /**
   * Process failed payment for IPN
   */
  private processFailedPaymentIpn(
    transaction: PaymentTransaction,
  ): ResultAsync<{ RspCode: string; Message: string }, DomainError> {
    transaction.markFailed({ responseCode: '99' });

    return this.paymentTransactionRepository.save(transaction).andThen(() => {
      if (transaction.type === PaymentType.TOPUP) {
        return this.walletService
          .processTopupFailed(transaction.vnpayTxnRef)
          .map(() => ({ RspCode: '00', Message: 'Payment failed confirmed' }));
      } else if (
        transaction.type === PaymentType.ORDER_PAYMENT &&
        transaction.orderId
      ) {
        return this.orderService
          .processVnpayPaymentFailed(transaction.orderId)
          .map(() => ({ RspCode: '00', Message: 'Payment failed confirmed' }));
      }

      return okAsync({ RspCode: '00', Message: 'Payment failed confirmed' });
    });
  }
}

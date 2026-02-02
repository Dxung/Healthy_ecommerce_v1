import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AsyncLocalStorage } from 'async_hooks';
import { v7 as uuidv7 } from 'uuid';
import { okAsync, errAsync, ResultAsync } from 'neverthrow';
import type { ITopupRepository } from '../repository/topup.repository.interface';
import type { IPaymentTransactionRepository } from '../repository/payment-transaction.repository.interface';
import type { IWalletRepository } from '../repository/wallet.repository.interface';
import type { IVnpayService } from '../services/vnpay.service.interface';
import type { IUow } from 'src/shared/unitOfWork/interfaces/uow.interface';
import type { DomainError } from 'src/shared/types/domain-error.type';
import { Topup } from '../models/topup.model';
import { PaymentTransaction } from '../models/payment-transaction.model';
import { WalletTransaction } from '../models/wallet-transaction.model';
import { WalletTransactionType } from 'src/database/typeorm/entities/payment/enums/wallet-transaction-type.enum';
import {
  TOPUP_REPOSITORY,
  PAYMENT_TRANSACTION_REPOSITORY,
  WALLET_REPOSITORY,
} from 'src/database/typeorm/tokens/database.token';
import { VNPAY_SERVICE } from '../tokens/payment.token';
import { UOW_TOKEN } from 'src/shared/unitOfWork/tokens/uow.token';
import { ITypeORMAlsStore } from 'src/shared/als/interfaces/als-store.interface';

// How often to check for stale topups (in minutes)
const TOPUP_STALE_THRESHOLD_MINUTES = 10;

// VNPay data retention limit (in hours)
const VNPAY_DATA_RETENTION_HOURS = 48;

/**
 * TopupReconcileCronjob - Reconciles pending wallet topups with VNPay
 *
 * Runs every 10 minutes to:
 * 1. Find topups with status=PROCESSING that are older than 10 minutes
 * 2. For each topup:
 *    - Lock the record to prevent concurrent processing
 *    - Query VNPay API to check payment status
 *    - If VNPay SUCCESS: Credit wallet, update topup and payment transaction
 *    - If VNPay FAILED: Mark topup and payment transaction as failed
 *    - If VNPay still processing: Skip (will check again next run)
 * 3. For topups older than 48 hours: Mark as failed (VNPay no longer has data)
 */
@Injectable()
export class TopupReconcileCronjob {
  private readonly logger = new Logger(TopupReconcileCronjob.name);

  constructor(
    @Inject(TOPUP_REPOSITORY)
    private readonly topupRepository: ITopupRepository,
    @Inject(PAYMENT_TRANSACTION_REPOSITORY)
    private readonly paymentTransactionRepository: IPaymentTransactionRepository,
    @Inject(WALLET_REPOSITORY)
    private readonly walletRepository: IWalletRepository,
    @Inject(VNPAY_SERVICE)
    private readonly vnpayService: IVnpayService,
    @Inject(UOW_TOKEN)
    private readonly uow: IUow,
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
  ) {}

  /**
   * Cron job that runs every 10 minutes to reconcile pending topups.
   */
  @Cron('0 */10 * * * *', {
    name: 'topup-reconcile',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async handleReconcile(): Promise<void> {
    // Create ALS store for cronjob context
    const store: ITypeORMAlsStore = {
      requestId: uuidv7(),
      ctx: null,
    };

    await this.als.run(store, () => this.processReconcile());
  }

  /**
   * Internal method that contains the actual reconciliation logic.
   */
  private async processReconcile(): Promise<void> {
    this.logger.log('Starting topup reconciliation...');

    // Find stale processing topups
    const result = await this.topupRepository.findProcessingTopupsForReconcile(
      TOPUP_STALE_THRESHOLD_MINUTES,
      100,
    );

    await result.match(
      async (topups) => {
        if (topups.length === 0) {
          this.logger.debug('No stale topups found');
          return;
        }

        this.logger.log(`Found ${topups.length} stale topup(s) to reconcile`);

        let successCount = 0;
        let failedCount = 0;
        let skippedCount = 0;

        for (const topup of topups) {
          const reconcileResult = await this.reconcileTopup(topup);

          reconcileResult.match(
            (status) => {
              if (status === 'success') successCount++;
              else if (status === 'failed') failedCount++;
              else skippedCount++;
            },
            (error: DomainError) => {
              this.logger.error(
                `Failed to reconcile topup ${topup.id}: ${error.message}`,
              );
              skippedCount++;
            },
          );
        }

        this.logger.log(
          `Reconciliation complete: ${successCount} success, ${failedCount} failed, ${skippedCount} skipped`,
        );
      },
      (error: DomainError) => {
        this.logger.error(`Failed to fetch stale topups: ${error.message}`);
      },
    );
  }

  /**
   * Reconcile a single topup by querying VNPay and updating status.
   * Returns 'success', 'failed', or 'pending' based on the reconciliation result.
   */
  private reconcileTopup(
    topup: Topup,
  ): ResultAsync<'success' | 'failed' | 'pending', DomainError> {
    // Check if topup is too old (VNPay no longer has data)
    const ageHours =
      (Date.now() - topup.createdAt.getTime()) / (1000 * 60 * 60);
    if (ageHours > VNPAY_DATA_RETENTION_HOURS) {
      this.logger.warn(
        `Topup ${topup.id} is older than ${VNPAY_DATA_RETENTION_HOURS} hours, marking as failed`,
      );
      return this.markTopupFailed(
        topup,
        `Expired: VNPay data no longer available after ${VNPAY_DATA_RETENTION_HOURS} hours`,
      );
    }

    // Find the payment transaction for this topup
    return this.paymentTransactionRepository
      .findByTopupId(topup.id)
      .andThen((paymentTxn) => {
        if (!paymentTxn) {
          this.logger.warn(
            `No payment transaction found for topup ${topup.id}`,
          );
          return this.markTopupFailed(topup, 'Payment transaction not found');
        }

        // Query VNPay to check transaction status
        return this.vnpayService
          .queryTransaction({
            txnRef: paymentTxn.vnpayTxnRef,
            transactionDate: paymentTxn.createdAt,
            ipAddress: '127.0.0.1', // Internal query
          })
          .andThen((vnpayResult) => {
            if (vnpayResult.isSuccess) {
              // VNPay confirms payment was successful
              this.logger.log(
                `VNPay confirmed success for topup ${topup.id}, txnRef: ${paymentTxn.vnpayTxnRef}`,
              );
              return this.processSuccessfulTopup(
                topup,
                paymentTxn,
                vnpayResult.transactionNo || '',
                vnpayResult.bankCode || '',
              );
            } else if (vnpayResult.responseCode === '00') {
              // Query successful but transaction not found or pending
              return okAsync<'success' | 'failed' | 'pending', DomainError>(
                'pending',
              );
            } else {
              // VNPay confirms payment failed
              this.logger.log(
                `VNPay confirmed failure for topup ${topup.id}, code: ${vnpayResult.responseCode}`,
              );
              return this.markTopupFailed(topup, vnpayResult.message);
            }
          })
          .orElse((error: DomainError) => {
            this.logger.error(
              `Failed to query VNPay for topup ${topup.id}: ${error.message}`,
            );
            return okAsync<'success' | 'failed' | 'pending', DomainError>(
              'pending',
            );
          });
      });
  }

  /**
   * Process a successful topup - credit wallet and update records
   */
  private processSuccessfulTopup(
    topup: Topup,
    paymentTxn: PaymentTransaction,
    transactionNo: string,
    bankCode: string,
  ): ResultAsync<'success' | 'failed' | 'pending', DomainError> {
    return this.uow.executeInTransaction(() =>
      // Lock the topup record
      this.topupRepository.findByIdWithLock(topup.id).andThen((lockedTopup) => {
        if (!lockedTopup) {
          return errAsync({
            code: 'TOPUP_NOT_FOUND',
            message: 'Topup not found',
          } as DomainError);
        }

        // Check if already processed (race condition check)
        if (!lockedTopup.isProcessing()) {
          return okAsync<'success' | 'failed' | 'pending', DomainError>(
            'success',
          );
        }

        // Mark topup as success
        lockedTopup.markSuccess();

        return this.topupRepository.update(lockedTopup).andThen(() =>
          // Update payment transaction
          this.paymentTransactionRepository
            .findByTxnRef(paymentTxn.vnpayTxnRef)
            .andThen((txn) => {
              if (txn && txn.isPending()) {
                txn.markSuccess({
                  transactionNo,
                  responseCode: '00',
                  bankCode,
                });
                return this.paymentTransactionRepository.update(txn);
              }
              return okAsync(txn);
            })
            .andThen(() =>
              // Credit wallet
              this.walletRepository.findById(lockedTopup.walletId),
            )
            .andThen((wallet) => {
              if (!wallet) {
                return errAsync({
                  code: 'WALLET_NOT_FOUND',
                  message: 'Wallet not found',
                } as DomainError);
              }

              const balanceBefore = wallet.credit(lockedTopup.amount);
              const balanceAfter = wallet.balance;

              const walletTxn = WalletTransaction.create({
                walletId: wallet.id,
                type: WalletTransactionType.TOPUP,
                amount: lockedTopup.amount,
                balanceBefore,
                balanceAfter,
                referenceType: 'topup',
                referenceId: lockedTopup.id,
                description: `Nạp tiền từ VNPay - ${transactionNo} (Reconciled)`,
              });

              return this.walletRepository
                .saveWallet(wallet)
                .andThen(() =>
                  this.walletRepository.createTransaction(walletTxn),
                )
                .map((): 'success' | 'failed' | 'pending' => 'success');
            }),
        );
      }),
    );
  }

  /**
   * Mark a topup as failed
   */
  private markTopupFailed(
    topup: Topup,
    reason: string,
  ): ResultAsync<'success' | 'failed' | 'pending', DomainError> {
    return this.uow.executeInTransaction(() =>
      this.topupRepository.findByIdWithLock(topup.id).andThen((lockedTopup) => {
        if (!lockedTopup || !lockedTopup.isProcessing()) {
          return okAsync<'success' | 'failed' | 'pending', DomainError>(
            'failed',
          );
        }

        lockedTopup.markFailed(reason);

        return this.topupRepository
          .update(lockedTopup)
          .map((): 'success' | 'failed' | 'pending' => 'failed');
      }),
    );
  }
}

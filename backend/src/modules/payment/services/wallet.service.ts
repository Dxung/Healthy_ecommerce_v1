import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { ResultAsync, okAsync, errAsync } from 'neverthrow';
import {
  IWalletService,
  WalletBalanceDto,
  PaginatedTransactionsResult,
  TopupResult,
} from './wallet.service.interface';
import { IVnpayService } from './vnpay.service.interface';
import { IWalletRepository } from '../repository/wallet.repository.interface';
import { ITopupRepository } from '../repository/topup.repository.interface';
import { IPaymentTransactionRepository } from '../repository/payment-transaction.repository.interface';
import { IShopService } from '../../shop/shop.service.interface';
import { Wallet } from '../models/wallet.model';
import { WalletTransaction } from '../models/wallet-transaction.model';
import { PaymentTransaction } from '../models/payment-transaction.model';
import { Topup } from '../models/topup.model';
import { WalletTransactionType } from 'src/database/typeorm/entities/payment/enums/wallet-transaction-type.enum';
import { WalletOwnerType } from 'src/database/typeorm/entities/payment/enums/wallet-owner-type.enum';
import { VNPAY_SERVICE } from '../tokens/payment.token';
import { SHOP_SERVICE } from '../../shop/tokens/shop.token';
import {
  WALLET_REPOSITORY,
  TOPUP_REPOSITORY,
  PAYMENT_TRANSACTION_REPOSITORY,
} from 'src/database/typeorm/tokens/database.token';
import {
  createDomainError,
  DomainError,
} from 'src/shared/types/domain-error.type';
import { PAYMENT_ERRORS } from '../errors/payment.errors';
import { SHARED_ERRORS } from 'src/shared/errors/shared.errors';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import { ITypeORMAlsStore } from 'src/shared/als/interfaces/als-store.interface';

@Injectable()
export class WalletService implements IWalletService {
  constructor(
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
    @Inject(WALLET_REPOSITORY)
    private readonly walletRepository: IWalletRepository,
    @Inject(TOPUP_REPOSITORY)
    private readonly topupRepository: ITopupRepository,
    @Inject(PAYMENT_TRANSACTION_REPOSITORY)
    private readonly paymentTransactionRepository: IPaymentTransactionRepository,
    @Inject(VNPAY_SERVICE)
    private readonly vnpayService: IVnpayService,
    @Inject(forwardRef(() => SHOP_SERVICE))
    private readonly shopService: IShopService,
  ) {}

  @WithPosition()
  getMyWallet(): ResultAsync<Wallet, DomainError> {
    const store = this.als.getStore();
    const userId = store?.userId;

    if (!userId) {
      return errAsync(
        createDomainError(SHARED_ERRORS.SYSTEM_ERROR, {
          cause: 'User ID not found in ALS',
        }),
      );
    }

    return this.walletRepository.findOrCreateForBuyer(userId);
  }

  @WithPosition()
  getWalletBalance(): ResultAsync<WalletBalanceDto, DomainError> {
    return this.getMyWallet().map((wallet) => ({
      id: wallet.id,
      balance: wallet.balance,
      frozenBalance: wallet.frozenBalance,
      availableBalance: wallet.availableBalance,
    }));
  }

  @WithPosition()
  getTransactionHistory(
    page: number,
    limit: number,
  ): ResultAsync<PaginatedTransactionsResult, DomainError> {
    return this.getMyWallet().andThen((wallet) =>
      this.walletRepository.findTransactionsByWalletId(wallet.id, {
        page,
        limit,
      }),
    );
  }

  @WithPosition()
  initiateTopup(
    amount: number,
    ipAddress: string,
  ): ResultAsync<TopupResult, DomainError> {
    if (amount < 10000) {
      return errAsync(
        createDomainError(PAYMENT_ERRORS.INVALID_AMOUNT, {
          cause: 'Minimum topup amount is 10,000 VND',
        }),
      );
    }

    return this.getMyWallet().andThen((wallet) => {
      // Step 1: Create Topup record (business entity)
      const topup = Topup.create({
        walletId: wallet.id,
        amount,
      });

      return this.topupRepository.create(topup).andThen((savedTopup) => {
        // Step 2: Create PaymentTransaction record (VNPay audit)
        const paymentTxn = PaymentTransaction.createForTopup({
          topupId: savedTopup.id,
          amount,
        });

        return this.paymentTransactionRepository
          .create(paymentTxn)
          .andThen((savedTxn) => {
            // Step 3: Generate VNPay payment URL
            return this.vnpayService
              .createPaymentUrl({
                orderId: savedTopup.id,
                amount,
                orderInfo: `Nap tien vi - ${amount.toLocaleString('vi-VN')} VND`,
                ipAddress,
                txnRef: savedTxn.vnpayTxnRef,
              })
              .map((vnpayResult) => ({
                paymentUrl: vnpayResult.paymentUrl,
                txnRef: savedTxn.vnpayTxnRef,
                topupId: savedTopup.id,
                transactionId: savedTxn.id,
              }));
          });
      });
    });
  }

  @WithPosition()
  processTopupSuccess(
    txnRef: string,
    amount: number,
    transactionNo: string,
    bankCode: string,
  ): ResultAsync<void, DomainError> {
    return this.paymentTransactionRepository
      .findByTxnRef(txnRef)
      .andThen((paymentTxn) => {
        if (!paymentTxn) {
          return errAsync(
            createDomainError(PAYMENT_ERRORS.PAYMENT_NOT_FOUND, {
              cause: null,
            }),
          );
        }

        if (paymentTxn.isSuccess()) {
          // Already processed
          return okAsync(undefined);
        }

        if (!paymentTxn.topupId) {
          return errAsync(
            createDomainError(PAYMENT_ERRORS.WALLET_NOT_FOUND, {
              cause: 'Topup ID not found in payment transaction',
            }),
          );
        }

        // Update payment transaction
        paymentTxn.markSuccess({
          transactionNo,
          responseCode: '00',
          bankCode,
        });

        return this.paymentTransactionRepository
          .update(paymentTxn)
          .andThen(() =>
            // Find the topup to get walletId
            this.topupRepository.findById(paymentTxn.topupId!),
          )
          .andThen((topup) => {
            if (!topup) {
              return errAsync(
                createDomainError(PAYMENT_ERRORS.WALLET_NOT_FOUND, {
                  cause: 'Topup not found',
                }),
              );
            }

            // Mark topup as success
            topup.markSuccess();

            return this.topupRepository.update(topup).andThen(() =>
              // Find wallet by ID
              this.walletRepository.findById(topup.walletId),
            );
          })
          .andThen((wallet) => {
            if (!wallet) {
              return errAsync(
                createDomainError(PAYMENT_ERRORS.WALLET_NOT_FOUND, {
                  cause: null,
                }),
              );
            }

            // Credit wallet
            const balanceBefore = wallet.credit(amount);
            const balanceAfter = wallet.balance;

            // Create wallet transaction
            const walletTxn = WalletTransaction.create({
              walletId: wallet.id,
              type: WalletTransactionType.TOPUP,
              amount,
              balanceBefore,
              balanceAfter,
              referenceType: 'topup',
              referenceId: paymentTxn.topupId!,
              description: `Nạp tiền từ VNPay - ${transactionNo}`,
            });

            // Save wallet and transaction
            return this.walletRepository
              .saveWallet(wallet)
              .andThen(() => this.walletRepository.createTransaction(walletTxn))
              .map(() => undefined);
          });
      });
  }

  @WithPosition()
  processTopupFailed(txnRef: string): ResultAsync<void, DomainError> {
    return this.paymentTransactionRepository
      .findByTxnRef(txnRef)
      .andThen((paymentTxn) => {
        if (!paymentTxn) {
          return errAsync(
            createDomainError(PAYMENT_ERRORS.PAYMENT_NOT_FOUND, {
              cause: null,
            }),
          );
        }

        if (!paymentTxn.isPending()) {
          // Already processed
          return okAsync(undefined);
        }

        paymentTxn.markFailed({
          responseCode: '99',
          responseMessage: 'Payment failed',
        });

        return this.paymentTransactionRepository
          .update(paymentTxn)
          .andThen(() => {
            // Also update topup status if exists
            if (paymentTxn.topupId) {
              return this.topupRepository
                .findById(paymentTxn.topupId)
                .andThen((topup) => {
                  if (topup && topup.isProcessing()) {
                    topup.markFailed('Payment failed or cancelled');
                    return this.topupRepository
                      .update(topup)
                      .map(() => undefined);
                  }
                  return okAsync(undefined);
                });
            }
            return okAsync(undefined);
          })
          .map(() => undefined);
      });
  }

  @WithPosition()
  debitForOrder(
    orderId: string,
    amount: number,
  ): ResultAsync<WalletTransaction, DomainError> {
    return this.getMyWallet().andThen((wallet) => {
      const debitResult = wallet.debit(amount);

      if (debitResult.isErr()) {
        return errAsync(debitResult.error);
      }

      const balanceBefore = debitResult.value;
      const balanceAfter = wallet.balance;

      const walletTxn = WalletTransaction.create({
        walletId: wallet.id,
        type: WalletTransactionType.ORDER_PAYMENT,
        amount: -amount, // Negative for debit
        balanceBefore,
        balanceAfter,
        referenceType: 'order',
        referenceId: orderId,
        description: `Thanh toán đơn hàng #${orderId.slice(0, 8)}`,
      });

      return this.walletRepository
        .saveWallet(wallet)
        .andThen(() => this.walletRepository.createTransaction(walletTxn));
    });
  }

  @WithPosition()
  creditFromRefund(
    orderId: string,
    amount: number,
  ): ResultAsync<WalletTransaction, DomainError> {
    return this.getMyWallet().andThen((wallet) => {
      const balanceBefore = wallet.credit(amount);
      const balanceAfter = wallet.balance;

      const walletTxn = WalletTransaction.create({
        walletId: wallet.id,
        type: WalletTransactionType.REFUND_RECEIVED,
        amount,
        balanceBefore,
        balanceAfter,
        referenceType: 'order',
        referenceId: orderId,
        description: `Hoàn tiền đơn hàng #${orderId.slice(0, 8)}`,
      });

      return this.walletRepository
        .saveWallet(wallet)
        .andThen(() => this.walletRepository.createTransaction(walletTxn));
    });
  }

  @WithPosition()
  getShopWallet(shopId: string): ResultAsync<Wallet, DomainError> {
    return this.walletRepository.findOrCreateForShop(shopId);
  }

  @WithPosition()
  getShopWalletBalance(
    shopId: string,
  ): ResultAsync<WalletBalanceDto, DomainError> {
    return this.getShopWallet(shopId).map((wallet) => ({
      id: wallet.id,
      balance: wallet.balance,
      frozenBalance: wallet.frozenBalance,
      availableBalance: wallet.availableBalance,
    }));
  }

  @WithPosition()
  getShopTransactionHistory(
    shopId: string,
    page: number,
    limit: number,
  ): ResultAsync<PaginatedTransactionsResult, DomainError> {
    return this.getShopWallet(shopId).andThen((wallet) =>
      this.walletRepository.findTransactionsByWalletId(wallet.id, {
        page,
        limit,
      }),
    );
  }

  @WithPosition()
  creditShopFromEscrow(
    shopId: string,
    orderId: string,
    amount: number,
  ): ResultAsync<WalletTransaction, DomainError> {
    return this.getShopWallet(shopId).andThen((wallet) => {
      const balanceBefore = wallet.credit(amount);
      const balanceAfter = wallet.balance;

      const walletTxn = WalletTransaction.create({
        walletId: wallet.id,
        type: WalletTransactionType.ESCROW_RELEASE,
        amount,
        balanceBefore,
        balanceAfter,
        referenceType: 'order',
        referenceId: orderId,
        description: `Nhận tiền đơn hàng #${orderId.slice(0, 8)}`,
      });

      return this.walletRepository
        .saveWallet(wallet)
        .andThen(() => this.walletRepository.createTransaction(walletTxn));
    });
  }

  @WithPosition()
  creditPlatformFromEscrow(
    orderId: string,
    amount: number,
  ): ResultAsync<WalletTransaction, DomainError> {
    return this.walletRepository.findOrCreateForPlatform().andThen((wallet) => {
      const balanceBefore = wallet.credit(amount);
      const balanceAfter = wallet.balance;

      const walletTxn = WalletTransaction.create({
        walletId: wallet.id,
        type: WalletTransactionType.PLATFORM_FEE,
        amount,
        balanceBefore,
        balanceAfter,
        referenceType: 'order',
        referenceId: orderId,
        description: `Phí sàn đơn hàng #${orderId.slice(0, 8)}`,
      });

      return this.walletRepository
        .saveWallet(wallet)
        .andThen(() => this.walletRepository.createTransaction(walletTxn));
    });
  }

  @WithPosition()
  debitPlatformForEscrow(
    orderId: string,
    amount: number,
  ): ResultAsync<WalletTransaction, DomainError> {
    return this.walletRepository.findOrCreateForPlatform().andThen((wallet) => {
      // Platform wallet can go negative (it's subsidizing shop due to coin usage)
      // We use credit with negative amount to allow this
      const balanceBefore = wallet.balance;
      wallet.credit(-amount); // Debit by crediting negative
      const balanceAfter = wallet.balance;

      const walletTxn = WalletTransaction.create({
        walletId: wallet.id,
        type: WalletTransactionType.PLATFORM_FEE,
        amount: -amount, // Negative to indicate debit
        balanceBefore,
        balanceAfter,
        referenceType: 'order',
        referenceId: orderId,
        description: `Bù xu đơn hàng #${orderId.slice(0, 8)}`,
      });

      return this.walletRepository
        .saveWallet(wallet)
        .andThen(() => this.walletRepository.createTransaction(walletTxn));
    });
  }

  /**
   * Helper method to get shop ID for current user
   */
  private getMyShopId(): ResultAsync<string, DomainError> {
    return this.shopService.getMyShop().andThen((shop) => {
      if (!shop) {
        return errAsync(
          createDomainError(PAYMENT_ERRORS.WALLET_NOT_FOUND, {
            cause: 'User does not have a shop',
          }),
        );
      }
      return okAsync(shop.id);
    });
  }

  @WithPosition()
  getMyShopWalletBalance(): ResultAsync<WalletBalanceDto, DomainError> {
    return this.getMyShopId().andThen((shopId) =>
      this.getShopWalletBalance(shopId),
    );
  }

  @WithPosition()
  getMyShopTransactionHistory(
    page: number,
    limit: number,
  ): ResultAsync<PaginatedTransactionsResult, DomainError> {
    return this.getMyShopId().andThen((shopId) =>
      this.getShopTransactionHistory(shopId, page, limit),
    );
  }
}

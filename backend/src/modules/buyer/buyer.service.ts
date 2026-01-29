import { Inject, Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { ResultAsync, errAsync } from 'neverthrow';
import { IBuyerService } from './buyer.service.interface';
import { IBuyerCoinWalletRepository } from './repository/buyer-coin-wallet.repository.interface';
import {
  BuyerCoinWallet,
  CoinTransaction,
} from './models/buyer-coin-wallet.model';
import { BUYER_COIN_WALLET_REPOSITORY } from 'src/database/typeorm/tokens/database.token';
import { ITypeORMAlsStore } from 'src/shared/als/interfaces/als-store.interface';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { SHARED_ERRORS } from 'src/shared/errors/shared.errors';
import { BUYER_ERRORS } from './errors/buyer.errors';
import type {
  PaginationParams,
  PaginatedResult,
} from 'src/shared/types/pagination.type';

@Injectable()
export class BuyerService implements IBuyerService {
  constructor(
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
    @Inject(BUYER_COIN_WALLET_REPOSITORY)
    private readonly coinWalletRepository: IBuyerCoinWalletRepository,
  ) {}

  private getUserId(): string | undefined {
    const store = this.als.getStore();
    return store?.userId;
  }

  @WithPosition()
  getMyCoinWallet(): ResultAsync<BuyerCoinWallet, DomainError> {
    const userId = this.getUserId();
    if (!userId) {
      return errAsync(
        createDomainError(SHARED_ERRORS.SYSTEM_ERROR, {
          cause: 'User ID not found in context',
        }),
      );
    }

    return this.coinWalletRepository.getOrCreate(userId);
  }

  @WithPosition()
  creditCoinsForOrder(
    buyerId: string,
    amount: number,
    orderId: string,
  ): ResultAsync<CoinTransaction, DomainError> {
    if (amount <= 0) {
      return errAsync(
        createDomainError(BUYER_ERRORS.INVALID_COIN_AMOUNT, {
          cause: 'Coin amount must be positive',
        }),
      );
    }

    return this.coinWalletRepository.creditCoins(
      buyerId,
      amount,
      'order_completion',
      orderId,
      `Nhận ${amount} xu từ đơn hàng`,
    );
  }

  @WithPosition()
  spendCoins(
    amount: number,
    referenceType: string,
    referenceId: string,
  ): ResultAsync<CoinTransaction, DomainError> {
    const userId = this.getUserId();
    if (!userId) {
      return errAsync(
        createDomainError(SHARED_ERRORS.SYSTEM_ERROR, {
          cause: 'User ID not found in context',
        }),
      );
    }

    if (amount <= 0) {
      return errAsync(
        createDomainError(BUYER_ERRORS.INVALID_COIN_AMOUNT, {
          cause: 'Coin amount must be positive',
        }),
      );
    }

    return this.coinWalletRepository.debitCoins(
      userId,
      amount,
      referenceType,
      referenceId,
      `Sử dụng ${amount} xu`,
    );
  }

  @WithPosition()
  getMyCoinTransactions(
    pagination: PaginationParams,
  ): ResultAsync<PaginatedResult<CoinTransaction>, DomainError> {
    const userId = this.getUserId();
    if (!userId) {
      return errAsync(
        createDomainError(SHARED_ERRORS.SYSTEM_ERROR, {
          cause: 'User ID not found in context',
        }),
      );
    }

    return this.coinWalletRepository.getTransactions(userId, pagination);
  }
}

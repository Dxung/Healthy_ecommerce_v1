import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { DataSource } from 'typeorm';
import { ResultAsync, errAsync, okAsync } from 'neverthrow';
import { ITypeORMAlsStore } from 'src/shared/als/interfaces/als-store.interface';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { SHARED_ERRORS } from 'src/shared/errors/shared.errors';
import { BUYER_ERRORS } from 'src/modules/buyer/errors/buyer.errors';
import { IBuyerCoinWalletRepository } from 'src/modules/buyer/repository/buyer-coin-wallet.repository.interface';
import {
  BuyerCoinWallet,
  CoinTransaction,
} from 'src/modules/buyer/models/buyer-coin-wallet.model';
import {
  PaginationParams,
  PaginatedResult,
  createPaginatedResult,
} from 'src/shared/types/pagination.type';
import { ORMBuyerCoinWallet } from '../../entities/buyer/orm.buyer-coin-wallet.entity';
import { ORMBuyerCoinTransaction } from '../../entities/buyer/orm.buyer-coin-transaction.entity';
import { ORMBuyerCoinWalletMapper } from '../../mappers/buyer-coin-wallet.mapper.orm';

@Injectable()
export class OrmBuyerCoinWalletRepository
  implements IBuyerCoinWalletRepository
{
  constructor(
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
    private readonly dataSource: DataSource,
  ) {}

  @WithPosition()
  findByBuyerId(
    buyerId: string,
  ): ResultAsync<BuyerCoinWallet | null, DomainError> {
    const repo = this.getWalletRepository();

    return ResultAsync.fromPromise(
      repo.findOne({ where: { buyerId } }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orm) => (orm ? ORMBuyerCoinWalletMapper.toDomain(orm) : null));
  }

  @WithPosition()
  create(wallet: BuyerCoinWallet): ResultAsync<BuyerCoinWallet, DomainError> {
    const repo = this.getWalletRepository();
    const orm = ORMBuyerCoinWalletMapper.toOrm(wallet);

    return ResultAsync.fromPromise(repo.save(orm), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((saved) => ORMBuyerCoinWalletMapper.toDomain(saved));
  }

  @WithPosition()
  update(wallet: BuyerCoinWallet): ResultAsync<BuyerCoinWallet, DomainError> {
    const repo = this.getWalletRepository();
    const orm = ORMBuyerCoinWalletMapper.toOrm(wallet);

    return ResultAsync.fromPromise(repo.save(orm), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((saved) => ORMBuyerCoinWalletMapper.toDomain(saved));
  }

  @WithPosition()
  createTransaction(
    transaction: CoinTransaction,
  ): ResultAsync<CoinTransaction, DomainError> {
    const repo = this.getTransactionRepository();
    const orm = ORMBuyerCoinWalletMapper.transactionToOrm(transaction);

    return ResultAsync.fromPromise(repo.save(orm), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((saved) => ORMBuyerCoinWalletMapper.transactionToDomain(saved));
  }

  @WithPosition()
  getOrCreate(buyerId: string): ResultAsync<BuyerCoinWallet, DomainError> {
    return this.findByBuyerId(buyerId).andThen((wallet) => {
      if (wallet) {
        return okAsync(wallet);
      }
      const newWallet = BuyerCoinWallet.createNew(buyerId);
      return this.create(newWallet);
    });
  }

  @WithPosition()
  creditCoins(
    buyerId: string,
    amount: number,
    referenceType: string,
    referenceId: string | null,
    description: string | null,
  ): ResultAsync<CoinTransaction, DomainError> {
    return this.getOrCreate(buyerId).andThen((wallet) => {
      const transaction = wallet.creditCoins(
        amount,
        referenceType,
        referenceId,
        description,
      );

      return this.update(wallet).andThen(() =>
        this.createTransaction(transaction),
      );
    });
  }

  @WithPosition()
  debitCoins(
    buyerId: string,
    amount: number,
    referenceType: string,
    referenceId: string | null,
    description: string | null,
  ): ResultAsync<CoinTransaction, DomainError> {
    return this.findByBuyerId(buyerId).andThen((wallet) => {
      if (!wallet) {
        return errAsync(
          createDomainError(BUYER_ERRORS.COIN_WALLET_NOT_FOUND, {
            cause: 'Buyer coin wallet not found',
          }),
        );
      }

      if (!wallet.hasEnoughBalance(amount)) {
        return errAsync(
          createDomainError(BUYER_ERRORS.INSUFFICIENT_COIN_BALANCE, {
            cause: 'Insufficient coin balance',
          }),
        );
      }

      const transaction = wallet.debitCoins(
        amount,
        referenceType,
        referenceId,
        description,
      );

      return this.update(wallet).andThen(() =>
        this.createTransaction(transaction),
      );
    });
  }

  @WithPosition()
  getTransactions(
    buyerId: string,
    pagination: PaginationParams,
  ): ResultAsync<PaginatedResult<CoinTransaction>, DomainError> {
    const repo = this.getTransactionRepository();
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    return ResultAsync.fromPromise(
      repo.findAndCount({
        where: { buyerId },
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map(([orms, total]) => {
      const items = ORMBuyerCoinWalletMapper.transactionsToDomain(orms);
      return createPaginatedResult(items, total, page, limit);
    });
  }

  @WithPosition()
  debitCoinsWithLock(
    buyerId: string,
    amount: number,
    referenceType: string,
    referenceId: string | null,
    description: string | null,
  ): ResultAsync<CoinTransaction, DomainError> {
    const em = this.getEntityManager();
    if (!em) {
      return errAsync(
        createDomainError(SHARED_ERRORS.SYSTEM_ERROR, {
          cause: 'debitCoinsWithLock must be called within a transaction',
        }),
      );
    }

    const walletRepo = em.getRepository(ORMBuyerCoinWallet);

    return ResultAsync.fromPromise(
      walletRepo.findOne({
        where: { buyerId },
        lock: { mode: 'pessimistic_write' },
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).andThen((ormWallet) => {
      if (!ormWallet) {
        return errAsync(
          createDomainError(BUYER_ERRORS.COIN_WALLET_NOT_FOUND, {
            cause: 'Buyer coin wallet not found',
          }),
        );
      }

      const wallet = ORMBuyerCoinWalletMapper.toDomain(ormWallet);

      if (!wallet.hasEnoughBalance(amount)) {
        return errAsync(
          createDomainError(BUYER_ERRORS.INSUFFICIENT_COIN_BALANCE, {
            cause: 'Insufficient coin balance',
          }),
        );
      }

      const transaction = wallet.debitCoins(
        amount,
        referenceType,
        referenceId,
        description,
      );

      // Save wallet and transaction
      const updatedOrm = ORMBuyerCoinWalletMapper.toOrm(wallet);
      const transactionOrm =
        ORMBuyerCoinWalletMapper.transactionToOrm(transaction);

      return ResultAsync.fromPromise(
        Promise.all([
          walletRepo.save(updatedOrm),
          em.getRepository(ORMBuyerCoinTransaction).save(transactionOrm),
        ]),
        (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
      ).map(() => transaction);
    });
  }

  @WithPosition()
  creditCoinsRefund(
    buyerId: string,
    amount: number,
    referenceType: string,
    referenceId: string | null,
    description: string | null,
  ): ResultAsync<CoinTransaction, DomainError> {
    return this.getOrCreate(buyerId).andThen((wallet) => {
      const transaction = wallet.refundCoins(
        amount,
        referenceType,
        referenceId,
        description,
      );

      return this.update(wallet).andThen(() =>
        this.createTransaction(transaction),
      );
    });
  }

  // ======================== PRIVATE HELPERS ========================

  private getEntityManager() {
    if (!this.als) return null;
    const store = this.als.getStore();
    if (!store || !store.ctx) return null;
    return store.ctx;
  }

  private getWalletRepository() {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return em.getRepository(ORMBuyerCoinWallet);
  }

  private getTransactionRepository() {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return em.getRepository(ORMBuyerCoinTransaction);
  }
}

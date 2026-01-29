import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ResultAsync, okAsync, errAsync } from 'neverthrow';
import { AsyncLocalStorage } from 'async_hooks';
import {
  IWalletRepository,
  PaginationOptions,
  PaginatedResult,
} from 'src/modules/payment/repository/wallet.repository.interface';
import { Wallet } from 'src/modules/payment/models/wallet.model';
import { WalletTransaction } from 'src/modules/payment/models/wallet-transaction.model';
import { ORMWallet } from '../../entities/payment/orm.wallet.entity';
import { ORMWalletTransaction } from '../../entities/payment/orm.wallet-transaction.entity';
import { ORMWalletMapper } from '../../mappers/wallet.mapper.orm';
import { WalletOwnerType } from '../../entities/payment/enums/wallet-owner-type.enum';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { SHARED_ERRORS } from 'src/shared/errors/shared.errors';
import { isQueryFailedPostgresError } from '../../guards/type-guard.database';
import { PG_UNIQUE_VIOLATION } from 'src/database/constant/postgresql-error.constant';
import { ITypeORMAlsStore } from 'src/shared/als/interfaces/als-store.interface';

@Injectable()
export class OrmWalletRepository implements IWalletRepository {
  constructor(
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
    private readonly dataSource: DataSource,
  ) {}

  @WithPosition()
  findByOwner(
    ownerType: WalletOwnerType,
    ownerId: string,
  ): ResultAsync<Wallet | null, DomainError> {
    const repo = this.getWalletRepository();

    return ResultAsync.fromPromise(
      repo.findOne({ where: { ownerType, ownerId } }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormWallet) =>
      ormWallet ? ORMWalletMapper.toDomain(ormWallet) : null,
    );
  }

  @WithPosition()
  findOrCreateForBuyer(buyerId: string): ResultAsync<Wallet, DomainError> {
    return this.findByOwner(WalletOwnerType.BUYER, buyerId).andThen(
      (existingWallet) => {
        if (existingWallet) {
          return okAsync(existingWallet);
        }
        const newWallet = Wallet.createForBuyer(buyerId);
        return this.saveWalletWithConflictRetry(
          newWallet,
          WalletOwnerType.BUYER,
          buyerId,
        );
      },
    );
  }

  @WithPosition()
  findOrCreateForShop(shopId: string): ResultAsync<Wallet, DomainError> {
    return this.findByOwner(WalletOwnerType.SHOP, shopId).andThen(
      (existingWallet) => {
        if (existingWallet) {
          return okAsync(existingWallet);
        }
        const newWallet = Wallet.createForShop(shopId);
        return this.saveWalletWithConflictRetry(
          newWallet,
          WalletOwnerType.SHOP,
          shopId,
        );
      },
    );
  }

  /**
   * Attempts to save a wallet, and if it fails due to unique constraint
   * (race condition), fetches the existing wallet instead.
   */
  private saveWalletWithConflictRetry(
    wallet: Wallet,
    ownerType: WalletOwnerType,
    ownerId: string,
  ): ResultAsync<Wallet, DomainError> {
    const repo = this.getWalletRepository();
    const ormWallet = ORMWalletMapper.toOrm(wallet);

    return ResultAsync.fromPromise(repo.save(ormWallet), (error) => error)
      .map((saved) => ORMWalletMapper.toDomain(saved))
      .orElse((error) => {
        // Check if it's a unique constraint violation (race condition)
        if (
          isQueryFailedPostgresError(error) &&
          error.driverError.code === PG_UNIQUE_VIOLATION
        ) {
          // Another request created the wallet, fetch it
          return this.findByOwner(ownerType, ownerId).andThen((existing) => {
            if (existing) {
              return okAsync(existing);
            }
            // Should not happen, but handle it
            return errAsync(
              createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
            );
          });
        }
        return errAsync(
          createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
        );
      });
  }

  @WithPosition()
  saveWallet(wallet: Wallet): ResultAsync<Wallet, DomainError> {
    const repo = this.getWalletRepository();
    const ormWallet = ORMWalletMapper.toOrm(wallet);

    return ResultAsync.fromPromise(repo.save(ormWallet), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((saved) => ORMWalletMapper.toDomain(saved));
  }

  @WithPosition()
  createTransaction(
    transaction: WalletTransaction,
  ): ResultAsync<WalletTransaction, DomainError> {
    const repo = this.getTransactionRepository();
    const ormTransaction = ORMWalletMapper.transactionToOrm(transaction);

    return ResultAsync.fromPromise(repo.save(ormTransaction), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((saved) => ORMWalletMapper.transactionToDomain(saved));
  }

  @WithPosition()
  findTransactionsByWalletId(
    walletId: string,
    pagination: PaginationOptions,
  ): ResultAsync<PaginatedResult<WalletTransaction>, DomainError> {
    const repo = this.getTransactionRepository();
    const skip = (pagination.page - 1) * pagination.limit;

    return ResultAsync.fromPromise(
      repo.findAndCount({
        where: { walletId },
        order: { createdAt: 'DESC' },
        skip,
        take: pagination.limit,
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map(([ormTransactions, total]) => ({
      items: ormTransactions.map((orm) =>
        ORMWalletMapper.transactionToDomain(orm),
      ),
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    }));
  }

  private getEntityManager() {
    const store = this.als.getStore();
    if (!store || !store.ctx) return null;
    return store.ctx;
  }

  private getWalletRepository() {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return em.getRepository(ORMWallet);
  }

  private getTransactionRepository() {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return em.getRepository(ORMWalletTransaction);
  }
}

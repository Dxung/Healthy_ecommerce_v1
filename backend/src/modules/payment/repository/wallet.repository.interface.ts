import type { ResultAsync } from 'neverthrow';
import type { DomainError } from 'src/shared/types/domain-error.type';
import type { Wallet } from '../models/wallet.model';
import type { WalletTransaction } from '../models/wallet-transaction.model';
import type { WalletOwnerType } from 'src/database/typeorm/entities/payment/enums/wallet-owner-type.enum';

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IWalletRepository {
  /**
   * Find wallet by owner type and owner ID
   */
  findByOwner(
    ownerType: WalletOwnerType,
    ownerId: string,
  ): ResultAsync<Wallet | null, DomainError>;

  /**
   * Find or create wallet for a buyer
   */
  findOrCreateForBuyer(buyerId: string): ResultAsync<Wallet, DomainError>;

  /**
   * Find or create wallet for a shop
   */
  findOrCreateForShop(shopId: string): ResultAsync<Wallet, DomainError>;

  /**
   * Save wallet (create or update)
   */
  saveWallet(wallet: Wallet): ResultAsync<Wallet, DomainError>;

  /**
   * Create a wallet transaction
   */
  createTransaction(
    transaction: WalletTransaction,
  ): ResultAsync<WalletTransaction, DomainError>;

  /**
   * Find transactions by wallet ID with pagination
   */
  findTransactionsByWalletId(
    walletId: string,
    pagination: PaginationOptions,
  ): ResultAsync<PaginatedResult<WalletTransaction>, DomainError>;
}

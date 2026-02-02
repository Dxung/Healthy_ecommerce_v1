import type { ResultAsync } from 'neverthrow';
import type { DomainError } from 'src/shared/types/domain-error.type';
import type {
  BuyerCoinWallet,
  CoinTransaction,
} from '../models/buyer-coin-wallet.model';
import type {
  PaginationParams,
  PaginatedResult,
} from 'src/shared/types/pagination.type';

export interface IBuyerCoinWalletRepository {
  /**
   * Finds a buyer's coin wallet by buyer ID.
   * Returns null if the wallet doesn't exist.
   */
  findByBuyerId(
    buyerId: string,
  ): ResultAsync<BuyerCoinWallet | null, DomainError>;

  /**
   * Creates a new coin wallet for a buyer.
   */
  create(wallet: BuyerCoinWallet): ResultAsync<BuyerCoinWallet, DomainError>;

  /**
   * Updates an existing coin wallet balance.
   */
  update(wallet: BuyerCoinWallet): ResultAsync<BuyerCoinWallet, DomainError>;

  /**
   * Creates a coin transaction record.
   */
  createTransaction(
    transaction: CoinTransaction,
  ): ResultAsync<CoinTransaction, DomainError>;

  /**
   * Gets or creates a coin wallet for a buyer.
   * If wallet doesn't exist, creates a new one with 0 balance.
   */
  getOrCreate(buyerId: string): ResultAsync<BuyerCoinWallet, DomainError>;

  /**
   * Credits coins to buyer wallet and records transaction.
   * Creates wallet if it doesn't exist.
   */
  creditCoins(
    buyerId: string,
    amount: number,
    referenceType: string,
    referenceId: string | null,
    description: string | null,
  ): ResultAsync<CoinTransaction, DomainError>;

  /**
   * Debits coins from buyer wallet and records transaction.
   * Fails if wallet doesn't exist or insufficient balance.
   */
  debitCoins(
    buyerId: string,
    amount: number,
    referenceType: string,
    referenceId: string | null,
    description: string | null,
  ): ResultAsync<CoinTransaction, DomainError>;

  /**
   * Gets transaction history for a buyer.
   */
  getTransactions(
    buyerId: string,
    pagination: PaginationParams,
  ): ResultAsync<PaginatedResult<CoinTransaction>, DomainError>;

  /**
   * Debits coins from buyer wallet with pessimistic lock.
   * Must be called within a transaction.
   * Fails if wallet doesn't exist or insufficient balance.
   */
  debitCoinsWithLock(
    buyerId: string,
    amount: number,
    referenceType: string,
    referenceId: string | null,
    description: string | null,
  ): ResultAsync<CoinTransaction, DomainError>;

  /**
   * Credits coins to buyer wallet as a refund.
   * Creates wallet if it doesn't exist.
   * Uses REFUNDED transaction type.
   */
  creditCoinsRefund(
    buyerId: string,
    amount: number,
    referenceType: string,
    referenceId: string | null,
    description: string | null,
  ): ResultAsync<CoinTransaction, DomainError>;
}

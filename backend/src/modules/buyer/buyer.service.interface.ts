import type { ResultAsync } from 'neverthrow';
import type { DomainError } from 'src/shared/types/domain-error.type';
import type {
  PaginationParams,
  PaginatedResult,
} from 'src/shared/types/pagination.type';
import type {
  BuyerCoinWallet,
  CoinTransaction,
} from './models/buyer-coin-wallet.model';

export interface IBuyerService {
  /**
   * Gets the current buyer's coin wallet.
   * Creates one if it doesn't exist.
   */
  getMyCoinWallet(): ResultAsync<BuyerCoinWallet, DomainError>;

  /**
   * Credits coins to a buyer's wallet (typically after order completion).
   * @param buyerId - The buyer's user ID
   * @param amount - Number of coins to credit
   * @param orderId - The order ID that generated these coins
   */
  creditCoinsForOrder(
    buyerId: string,
    amount: number,
    orderId: string,
  ): ResultAsync<CoinTransaction, DomainError>;

  /**
   * Debits coins from the current buyer's wallet (for spending).
   * @param amount - Number of coins to debit
   * @param referenceType - Type of reference (e.g., 'order')
   * @param referenceId - ID of the reference entity
   */
  spendCoins(
    amount: number,
    referenceType: string,
    referenceId: string,
  ): ResultAsync<CoinTransaction, DomainError>;

  /**
   * Gets the current buyer's coin transaction history.
   */
  getMyCoinTransactions(
    pagination: PaginationParams,
  ): ResultAsync<PaginatedResult<CoinTransaction>, DomainError>;
}

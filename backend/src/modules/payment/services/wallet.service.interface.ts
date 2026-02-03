import type { ResultAsync } from 'neverthrow';
import type { DomainError } from 'src/shared/types/domain-error.type';
import type { Wallet } from '../models/wallet.model';
import type { WalletTransaction } from '../models/wallet-transaction.model';

export interface WalletBalanceDto {
  id: string;
  balance: number;
  frozenBalance: number;
  availableBalance: number;
}

export interface PaginatedTransactionsResult {
  items: WalletTransaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TopupResult {
  paymentUrl: string;
  txnRef: string;
  topupId: string;
  transactionId: string;
}

export interface IWalletService {
  getMyWallet(): ResultAsync<Wallet, DomainError>;

  getWalletBalance(): ResultAsync<WalletBalanceDto, DomainError>;

  getTransactionHistory(
    page: number,
    limit: number,
  ): ResultAsync<PaginatedTransactionsResult, DomainError>;

  initiateTopup(
    amount: number,
    ipAddress: string,
  ): ResultAsync<TopupResult, DomainError>;

  processTopupSuccess(
    txnRef: string,
    amount: number,
    transactionNo: string,
    bankCode: string,
  ): ResultAsync<void, DomainError>;

  processTopupFailed(txnRef: string): ResultAsync<void, DomainError>;

  debitForOrder(
    orderId: string,
    amount: number,
  ): ResultAsync<WalletTransaction, DomainError>;

  creditFromRefund(
    orderId: string,
    amount: number,
  ): ResultAsync<WalletTransaction, DomainError>;

  /**
   * Credit buyer wallet from escrow refund (order cancellation)
   * Creates wallet transaction record for history
   * @param buyerId - Buyer ID to credit
   * @param orderId - Order ID for reference
   * @param amount - Amount to refund
   */
  creditBuyerFromEscrowRefund(
    buyerId: string,
    orderId: string,
    amount: number,
  ): ResultAsync<WalletTransaction, DomainError>;

  getShopWallet(shopId: string): ResultAsync<Wallet, DomainError>;

  getShopWalletBalance(
    shopId: string,
  ): ResultAsync<WalletBalanceDto, DomainError>;

  getShopTransactionHistory(
    shopId: string,
    page: number,
    limit: number,
  ): ResultAsync<PaginatedTransactionsResult, DomainError>;

  creditShopFromEscrow(
    shopId: string,
    orderId: string,
    amount: number,
  ): ResultAsync<WalletTransaction, DomainError>;

  /**
   * Credit platform wallet from escrow release (platform fee)
   * @param orderId - Order ID for reference
   * @param amount - Platform fee amount to credit
   */
  creditPlatformFromEscrow(
    orderId: string,
    amount: number,
  ): ResultAsync<WalletTransaction, DomainError>;

  /**
   * Debit platform wallet for escrow (when platform needs to subsidize shop)
   * This happens when coinUsed > platformFee
   * @param orderId - Order ID for reference
   * @param amount - Amount to debit from platform
   */
  debitPlatformForEscrow(
    orderId: string,
    amount: number,
  ): ResultAsync<WalletTransaction, DomainError>;

  /**
   * Get current user's shop wallet balance
   * Internally resolves shop ID from current user via ShopService
   */
  getMyShopWalletBalance(): ResultAsync<WalletBalanceDto, DomainError>;

  /**
   * Get current user's shop transaction history
   * Internally resolves shop ID from current user via ShopService
   */
  getMyShopTransactionHistory(
    page: number,
    limit: number,
  ): ResultAsync<PaginatedTransactionsResult, DomainError>;
}

import type { ResultAsync } from 'neverthrow';
import type { DomainError } from 'src/shared/types/domain-error.type';
import type { Wallet } from '../models/wallet.model';
import type { WalletTransaction } from '../models/wallet-transaction.model';
import type { EscrowStatus } from 'src/database/typeorm/entities/payment/enums/escrow-status.enum';

export interface PaginatedTransactionsResult {
  items: WalletTransaction[];
  total: number;
  page: number;
  limit: number;
}

export interface EscrowWithOrderAndShop {
  id: string;
  orderId: string;
  orderCode: string;
  shopId: string;
  shopName: string;
  amount: number;
  orderSubtotal: number;
  shippingFee: number;
  coinUsed: number;
  platformFeePercent: number;
  platformShipDiscount: number;
  status: EscrowStatus;
  createdAt: Date;
  releasedAt: Date | null;
}

export interface PaginatedEscrowsResult {
  items: EscrowWithOrderAndShop[];
  total: number;
  page: number;
  limit: number;
}

export interface EscrowListFilters {
  status?: EscrowStatus;
  fromDate?: string;
  toDate?: string;
}

export interface IAdminWalletService {
  /**
   * Get platform wallet
   */
  getPlatformWallet(): ResultAsync<Wallet, DomainError>;

  /**
   * Get platform wallet transactions with pagination
   */
  getPlatformTransactions(
    page: number,
    limit: number,
  ): ResultAsync<PaginatedTransactionsResult, DomainError>;

  /**
   * Get escrow holds with filtering and pagination
   */
  getEscrowHolds(
    filters: EscrowListFilters,
    page: number,
    limit: number,
  ): ResultAsync<PaginatedEscrowsResult, DomainError>;
}

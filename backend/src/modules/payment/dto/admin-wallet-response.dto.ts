import type { Wallet } from '../models/wallet.model';
import type { WalletTransaction } from '../models/wallet-transaction.model';
import { WalletTransactionType } from 'src/database/typeorm/entities/payment/enums/wallet-transaction-type.enum';

/**
 * Platform wallet balance response DTO
 */
export class PlatformWalletResponseDto {
  balance: number;
  frozenBalance: number;
  formattedBalance: string;

  constructor(wallet: Wallet) {
    this.balance = wallet.balance;
    this.frozenBalance = wallet.frozenBalance;
    this.formattedBalance = this.formatCurrency(wallet.balance);
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  }
}

/**
 * Platform transaction response DTO
 */
export class PlatformTransactionResponseDto {
  id: string;
  type: WalletTransactionType;
  typeLabel: string;
  amount: number;
  formattedAmount: string;
  balanceAfter: number;
  description: string | null;
  createdAt: Date;

  constructor(transaction: WalletTransaction) {
    this.id = transaction.id;
    this.type = transaction.type;
    this.typeLabel = this.getTypeLabel(transaction.type);
    this.amount = transaction.amount;
    this.formattedAmount = this.formatAmount(transaction.amount);
    this.balanceAfter = transaction.balanceAfter;
    this.description = transaction.description;
    this.createdAt = transaction.createdAt;
  }

  private getTypeLabel(type: WalletTransactionType): string {
    const labels: Record<WalletTransactionType, string> = {
      [WalletTransactionType.TOPUP]: 'Nạp tiền',
      [WalletTransactionType.ORDER_PAYMENT]: 'Thanh toán đơn hàng',
      [WalletTransactionType.REFUND_RECEIVED]: 'Nhận hoàn tiền',
      [WalletTransactionType.REFUND_DEDUCTED]: 'Trừ tiền hoàn trả',
      [WalletTransactionType.ESCROW_RELEASE]: 'Nhận tiền đơn hàng',
      [WalletTransactionType.PLATFORM_FEE]: 'Phí nền tảng',
      [WalletTransactionType.WITHDRAWAL]: 'Rút tiền',
    };
    return labels[type] || type;
  }

  private formatAmount(amount: number): string {
    const prefix = amount >= 0 ? '+' : '';
    return `${prefix}${new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)}`;
  }

  static fromList(
    transactions: WalletTransaction[],
  ): PlatformTransactionResponseDto[] {
    return transactions.map((t) => new PlatformTransactionResponseDto(t));
  }
}

/**
 * Paginated platform transactions response DTO
 */
export class PlatformTransactionsListResponseDto {
  items: PlatformTransactionResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;

  constructor(
    transactions: WalletTransaction[],
    total: number,
    page: number,
    limit: number,
  ) {
    this.items = PlatformTransactionResponseDto.fromList(transactions);
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.totalPages = Math.ceil(total / limit);
  }
}

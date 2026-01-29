import { WalletTransaction } from '../models/wallet-transaction.model';
import { WalletTransactionType } from 'src/database/typeorm/entities/payment/enums/wallet-transaction-type.enum';

export class WalletTransactionResponseDto {
  id: string;
  type: WalletTransactionType;
  typeLabel: string;
  amount: number;
  formattedAmount: string;
  balanceBefore: number;
  balanceAfter: number;
  referenceType: string | null;
  referenceId: string | null;
  description: string | null;
  createdAt: Date;

  constructor(transaction: WalletTransaction) {
    this.id = transaction.id;
    this.type = transaction.type;
    this.typeLabel = this.getTypeLabel(transaction.type);
    this.amount = transaction.amount;
    this.formattedAmount = this.formatAmount(transaction.amount);
    this.balanceBefore = transaction.balanceBefore;
    this.balanceAfter = transaction.balanceAfter;
    this.referenceType = transaction.referenceType;
    this.referenceId = transaction.referenceId;
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

  static fromList(transactions: WalletTransaction[]): WalletTransactionResponseDto[] {
    return transactions.map((t) => new WalletTransactionResponseDto(t));
  }
}

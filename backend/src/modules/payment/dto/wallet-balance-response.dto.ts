import { WalletBalanceDto } from '../services/wallet.service.interface';

export class WalletBalanceResponseDto {
  id: string;
  balance: number;
  frozenBalance: number;
  availableBalance: number;
  formattedBalance: string;
  formattedAvailableBalance: string;

  constructor(data: WalletBalanceDto) {
    this.id = data.id;
    this.balance = data.balance;
    this.frozenBalance = data.frozenBalance;
    this.availableBalance = data.availableBalance;
    this.formattedBalance = this.formatCurrency(data.balance);
    this.formattedAvailableBalance = this.formatCurrency(data.availableBalance);
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  }
}

import { EscrowStatus } from 'src/database/typeorm/entities/payment/enums/escrow-status.enum';

interface EscrowData {
  id: string;
  orderId: string;
  shopId: string;
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

/**
 * Escrow hold response DTO for admin
 */
export class AdminEscrowResponseDto {
  id: string;
  orderId: string;
  orderCode: string;
  shopId: string;
  shopName: string;
  amount: number;
  formattedAmount: string;
  orderSubtotal: number;
  shippingFee: number;
  coinUsed: number;
  platformFeePercent: number;
  platformShipDiscount: number;
  status: EscrowStatus;
  statusLabel: string;
  createdAt: Date;
  releasedAt: Date | null;

  constructor(
    escrow: EscrowData,
    orderCode: string,
    shopName: string,
  ) {
    this.id = escrow.id;
    this.orderId = escrow.orderId;
    this.orderCode = orderCode;
    this.shopId = escrow.shopId;
    this.shopName = shopName;
    this.amount = escrow.amount;
    this.formattedAmount = this.formatCurrency(escrow.amount);
    this.orderSubtotal = escrow.orderSubtotal;
    this.shippingFee = escrow.shippingFee;
    this.coinUsed = escrow.coinUsed;
    this.platformFeePercent = escrow.platformFeePercent;
    this.platformShipDiscount = escrow.platformShipDiscount;
    this.status = escrow.status;
    this.statusLabel = this.getStatusLabel(escrow.status);
    this.createdAt = escrow.createdAt;
    this.releasedAt = escrow.releasedAt;
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  }

  private getStatusLabel(status: EscrowStatus): string {
    const labels: Record<EscrowStatus, string> = {
      [EscrowStatus.HOLDING]: 'Đang giữ',
      [EscrowStatus.RELEASED]: 'Đã giải ngân',
      [EscrowStatus.REFUNDED]: 'Đã hoàn tiền',
    };
    return labels[status] || status;
  }
}

/**
 * Paginated escrow list response DTO
 */
export class AdminEscrowListResponseDto {
  items: AdminEscrowResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;

  constructor(
    items: AdminEscrowResponseDto[],
    total: number,
    page: number,
    limit: number,
  ) {
    this.items = items;
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.totalPages = Math.ceil(total / limit);
  }
}

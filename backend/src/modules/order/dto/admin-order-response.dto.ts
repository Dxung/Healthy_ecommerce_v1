import type {
  OrderWithShopAndBuyer,
  PaginatedResult,
} from '../repository/order.repository.interface';
import { OrderStatus } from 'src/database/typeorm/entities/order/enums/order-status.enum';
import { PaymentStatus } from 'src/database/typeorm/entities/order/enums/payment-status.enum';
import { PaymentMethod } from 'src/database/typeorm/entities/order/enums/payment-method.enum';
import { CancelledBy } from 'src/database/typeorm/entities/order/enums/cancelled-by.enum';
import { OrderItemResponseDto } from './order-item-response.dto';

/**
 * Admin order response DTO with both shop and buyer info
 */
export class AdminOrderResponseDto {
  id: string;
  orderCode: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;

  receiverName: string;
  receiverPhone: string;
  shippingAddress: string;

  subtotal: number;
  shippingFee: number;
  platformFee: number;
  platformFeePercent: number;
  tierDiscountAmount: number;
  voucherDiscountAmount: number;
  coinUsed: number;
  platformShipDiscount: number;
  totalAmount: number;
  coinEarned: number;

  buyerNote: string | null;
  shopNote: string | null;

  shop: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  };

  buyer: {
    id: string;
    fullName: string | null;
    phone: string | null;
  };

  items: OrderItemResponseDto[];

  cancelledAt: Date | null;
  cancelReason: string | null;
  cancelledBy: CancelledBy | null;
  cancelledByAdminId: string | null;

  confirmedAt: Date | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  completedAt: Date | null;
  paidAt: Date | null;

  createdAt: Date;
  updatedAt: Date;

  constructor(orderWithShopAndBuyer: OrderWithShopAndBuyer) {
    const { order, shop, buyer } = orderWithShopAndBuyer;

    this.id = order.id;
    this.orderCode = order.orderCode;
    this.status = order.status;
    this.paymentMethod = order.paymentMethod;
    this.paymentStatus = order.paymentStatus;

    this.receiverName = order.receiverName;
    this.receiverPhone = order.receiverPhone;
    this.shippingAddress = order.shippingAddress;

    this.subtotal = order.subtotal;
    this.shippingFee = order.shippingFee;
    this.platformFee = order.platformFee;
    this.platformFeePercent = order.platformFeePercent;
    this.tierDiscountAmount = order.tierDiscountAmount;
    this.voucherDiscountAmount = order.voucherDiscountAmount;
    this.coinUsed = order.coinUsed;
    this.platformShipDiscount = order.platformShipDiscount;
    this.totalAmount = order.totalAmount;
    this.coinEarned = order.coinEarned;

    this.buyerNote = order.buyerNote;
    this.shopNote = order.shopNote;

    this.shop = shop;
    this.buyer = buyer;
    this.items = OrderItemResponseDto.fromList(order.items);

    this.cancelledAt = order.cancelledAt;
    this.cancelReason = order.cancelReason;
    this.cancelledBy = order.cancelledBy;
    this.cancelledByAdminId = order.cancelledByAdminId;

    this.confirmedAt = order.confirmedAt;
    this.shippedAt = order.shippedAt;
    this.deliveredAt = order.deliveredAt;
    this.completedAt = order.completedAt;
    this.paidAt = order.paidAt;

    this.createdAt = order.createdAt;
    this.updatedAt = order.updatedAt;
  }

  static fromList(
    ordersWithShopAndBuyer: OrderWithShopAndBuyer[],
  ): AdminOrderResponseDto[] {
    return ordersWithShopAndBuyer.map((o) => new AdminOrderResponseDto(o));
  }
}

/**
 * Admin order list response DTO with pagination
 */
export class AdminOrderListResponseDto {
  items: AdminOrderResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;

  constructor(result: PaginatedResult<OrderWithShopAndBuyer>) {
    this.items = AdminOrderResponseDto.fromList(result.items);
    this.total = result.total;
    this.page = result.page;
    this.limit = result.limit;
    this.totalPages = result.totalPages;
  }
}

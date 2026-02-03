import type {
  OrderWithShop,
  OrderWithBuyer,
} from '../repository/order.repository.interface';
import { OrderStatus } from 'src/database/typeorm/entities/order/enums/order-status.enum';
import { PaymentStatus } from 'src/database/typeorm/entities/order/enums/payment-status.enum';
import { PaymentMethod } from 'src/database/typeorm/entities/order/enums/payment-method.enum';
import { CancelledBy } from 'src/database/typeorm/entities/order/enums/cancelled-by.enum';
import { OrderItemResponseDto } from './order-item-response.dto';

/**
 * Full order detail response for buyer
 */
export class OrderResponseDto {
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

  items: OrderItemResponseDto[];

  cancelledAt: Date | null;
  cancelReason: string | null;
  cancelledBy: CancelledBy | null;

  confirmedAt: Date | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  completedAt: Date | null;
  paidAt: Date | null;

  createdAt: Date;
  updatedAt: Date;

  constructor(orderWithShop: OrderWithShop) {
    const { order, shop } = orderWithShop;

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
    this.tierDiscountAmount = order.tierDiscountAmount;
    this.voucherDiscountAmount = order.voucherDiscountAmount;
    this.coinUsed = order.coinUsed;
    this.platformShipDiscount = order.platformShipDiscount;
    this.totalAmount = order.totalAmount;
    this.coinEarned = order.coinEarned;

    this.buyerNote = order.buyerNote;
    this.shopNote = order.shopNote;

    this.shop = shop;
    this.items = OrderItemResponseDto.fromList(order.items);

    this.cancelledAt = order.cancelledAt;
    this.cancelReason = order.cancelReason;
    this.cancelledBy = order.cancelledBy;

    this.confirmedAt = order.confirmedAt;
    this.shippedAt = order.shippedAt;
    this.deliveredAt = order.deliveredAt;
    this.completedAt = order.completedAt;
    this.paidAt = order.paidAt;

    this.createdAt = order.createdAt;
    this.updatedAt = order.updatedAt;
  }

  static fromList(ordersWithShop: OrderWithShop[]): OrderResponseDto[] {
    return ordersWithShop.map((o) => new OrderResponseDto(o));
  }
}

/**
 * Full order detail response for shop
 */
export class ShopOrderResponseDto {
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
  coinUsed: number;
  platformShipDiscount: number;
  totalAmount: number;
  /** Amount shop will receive = subtotal - platformFee + shippingFee */
  shopReceiveAmount: number;

  buyerNote: string | null;
  shopNote: string | null;

  buyer: {
    id: string;
    fullName: string | null;
    avatarUrl: string | null;
  };

  items: OrderItemResponseDto[];

  cancelledAt: Date | null;
  cancelReason: string | null;
  cancelledBy: CancelledBy | null;

  confirmedAt: Date | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  completedAt: Date | null;
  paidAt: Date | null;

  createdAt: Date;
  updatedAt: Date;

  constructor(orderWithBuyer: OrderWithBuyer) {
    const { order, buyer } = orderWithBuyer;

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
    this.coinUsed = order.coinUsed;
    this.platformShipDiscount = order.platformShipDiscount;
    this.totalAmount = order.totalAmount;
    this.shopReceiveAmount = order.subtotal - order.platformFee + order.shippingFee;

    this.buyerNote = order.buyerNote;
    this.shopNote = order.shopNote;

    this.buyer = buyer;
    this.items = OrderItemResponseDto.fromList(order.items);

    this.cancelledAt = order.cancelledAt;
    this.cancelReason = order.cancelReason;
    this.cancelledBy = order.cancelledBy;

    this.confirmedAt = order.confirmedAt;
    this.shippedAt = order.shippedAt;
    this.deliveredAt = order.deliveredAt;
    this.completedAt = order.completedAt;
    this.paidAt = order.paidAt;

    this.createdAt = order.createdAt;
    this.updatedAt = order.updatedAt;
  }

  static fromList(ordersWithBuyer: OrderWithBuyer[]): ShopOrderResponseDto[] {
    return ordersWithBuyer.map((o) => new ShopOrderResponseDto(o));
  }
}

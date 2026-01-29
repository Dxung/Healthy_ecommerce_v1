import type {
  OrderWithShop,
  OrderWithBuyer,
  PaginatedResult,
} from '../repository/order.repository.interface';
import { OrderStatus } from 'src/database/typeorm/entities/order/enums/order-status.enum';
import { PaymentStatus } from 'src/database/typeorm/entities/order/enums/payment-status.enum';
import { OrderItemResponseDto } from './order-item-response.dto';

/**
 * Order list item for buyer
 */
export class OrderListItemDto {
  id: string;
  orderCode: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  itemCount: number;

  shop: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  };

  /** First few items for preview */
  items: OrderItemResponseDto[];

  createdAt: Date;

  constructor(orderWithShop: OrderWithShop) {
    const { order, shop } = orderWithShop;

    this.id = order.id;
    this.orderCode = order.orderCode;
    this.status = order.status;
    this.paymentStatus = order.paymentStatus;
    this.totalAmount = order.totalAmount;
    this.itemCount = order.itemCount;
    this.shop = shop;
    this.items = OrderItemResponseDto.fromList(order.items.slice(0, 3));
    this.createdAt = order.createdAt;
  }
}

/**
 * Order list item for shop
 */
export class ShopOrderListItemDto {
  id: string;
  orderCode: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  itemCount: number;

  buyer: {
    id: string;
    fullName: string | null;
    avatarUrl: string | null;
  };

  receiverName: string;
  receiverPhone: string;

  /** First few items for preview */
  items: OrderItemResponseDto[];

  createdAt: Date;

  constructor(orderWithBuyer: OrderWithBuyer) {
    const { order, buyer } = orderWithBuyer;

    this.id = order.id;
    this.orderCode = order.orderCode;
    this.status = order.status;
    this.paymentStatus = order.paymentStatus;
    this.totalAmount = order.totalAmount;
    this.itemCount = order.itemCount;
    this.buyer = buyer;
    this.receiverName = order.receiverName;
    this.receiverPhone = order.receiverPhone;
    this.items = OrderItemResponseDto.fromList(order.items.slice(0, 3));
    this.createdAt = order.createdAt;
  }
}

/**
 * Paginated order list response for buyer
 */
export class OrderListResponseDto {
  items: OrderListItemDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;

  constructor(paginatedResult: PaginatedResult<OrderWithShop>) {
    this.items = paginatedResult.items.map((o) => new OrderListItemDto(o));
    this.total = paginatedResult.total;
    this.page = paginatedResult.page;
    this.limit = paginatedResult.limit;
    this.totalPages = paginatedResult.totalPages;
  }
}

/**
 * Paginated order list response for shop
 */
export class ShopOrderListResponseDto {
  items: ShopOrderListItemDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;

  constructor(paginatedResult: PaginatedResult<OrderWithBuyer>) {
    this.items = paginatedResult.items.map((o) => new ShopOrderListItemDto(o));
    this.total = paginatedResult.total;
    this.page = paginatedResult.page;
    this.limit = paginatedResult.limit;
    this.totalPages = paginatedResult.totalPages;
  }
}

import type { ResultAsync } from 'neverthrow';
import type { DomainError } from 'src/shared/types/domain-error.type';
import type { Order } from '../models/order.model';
import type { OrderItem } from '../models/order-item.model';
import type { OrderStatus } from 'src/database/typeorm/entities/order/enums/order-status.enum';

/**
 * Order with shop information for buyer views
 */
export interface OrderWithShop {
  order: Order;
  shop: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  };
}

/**
 * Order with buyer information for shop views
 */
export interface OrderWithBuyer {
  order: Order;
  buyer: {
    id: string;
    fullName: string | null;
    avatarUrl: string | null;
  };
}

/**
 * Order list filter options
 */
export interface OrderListFilters {
  status?: OrderStatus;
  fromDate?: Date;
  toDate?: Date;
}

/**
 * Admin order list filter options
 */
export interface AdminOrderListFilters {
  status?: OrderStatus;
  search?: string;
  shopId?: string;
  buyerId?: string;
  fromDate?: Date;
  toDate?: Date;
}

/**
 * Order with both shop and buyer information for admin views
 */
export interface OrderWithShopAndBuyer {
  order: Order;
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
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  page: number;
  limit: number;
}

/**
 * Paginated result
 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Order item with its parent order
 */
export interface OrderItemWithOrder {
  item: OrderItem;
  order: Order;
}

export interface IOrderRepository {
  /**
   * Find order by ID (without items)
   */
  findById(orderId: string): ResultAsync<Order | null, DomainError>;

  /**
   * Find order item by ID with its parent order
   */
  findOrderItemById(
    orderItemId: string,
  ): ResultAsync<OrderItemWithOrder | null, DomainError>;

  /**
   * Update an order item (e.g., for refund status)
   */
  updateOrderItem(item: OrderItem): ResultAsync<OrderItem, DomainError>;

  /**
   * Find order by ID with items
   */
  findByIdWithItems(orderId: string): ResultAsync<Order | null, DomainError>;

  /**
   * Find order by order code
   */
  findByOrderCode(orderCode: string): ResultAsync<Order | null, DomainError>;

  /**
   * Find orders by buyer ID with pagination and filters
   */
  findByBuyerId(
    buyerId: string,
    filters: OrderListFilters,
    pagination: PaginationOptions,
  ): ResultAsync<PaginatedResult<OrderWithShop>, DomainError>;

  /**
   * Find orders by shop ID with pagination and filters
   */
  findByShopId(
    shopId: string,
    filters: OrderListFilters,
    pagination: PaginationOptions,
  ): ResultAsync<PaginatedResult<OrderWithBuyer>, DomainError>;

  /**
   * Find order by ID for buyer (includes shop info)
   */
  findByIdForBuyer(
    orderId: string,
    buyerId: string,
  ): ResultAsync<OrderWithShop | null, DomainError>;

  /**
   * Find order by ID for shop (includes buyer info)
   */
  findByIdForShop(
    orderId: string,
    shopId: string,
  ): ResultAsync<OrderWithBuyer | null, DomainError>;

  /**
   * Save new order with items
   */
  saveOrderWithItems(
    order: Order,
    items: OrderItem[],
  ): ResultAsync<Order, DomainError>;

  /**
   * Update order status and related fields
   */
  updateOrder(order: Order): ResultAsync<Order, DomainError>;

  /**
   * Save order (alias for updateOrder)
   */
  save(order: Order): ResultAsync<Order, DomainError>;

  /**
   * Find orders that are delivered and past auto-complete deadline
   */
  findOrdersForAutoComplete(
    daysAfterDelivery: number,
  ): ResultAsync<Order[], DomainError>;

  /**
   * Count orders by status for buyer
   */
  countByBuyerIdAndStatus(
    buyerId: string,
    status: OrderStatus,
  ): ResultAsync<number, DomainError>;

  /**
   * Count orders by status for shop
   */
  countByShopIdAndStatus(
    shopId: string,
    status: OrderStatus,
  ): ResultAsync<number, DomainError>;

  // ===================== ADMIN METHODS =====================

  /**
   * Find all orders for admin view with pagination and filters
   */
  findAllForAdmin(
    filters: AdminOrderListFilters,
    pagination: PaginationOptions,
  ): ResultAsync<PaginatedResult<OrderWithShopAndBuyer>, DomainError>;

  /**
   * Find order by ID for admin (includes shop and buyer info)
   */
  findByIdForAdmin(
    orderId: string,
  ): ResultAsync<OrderWithShopAndBuyer | null, DomainError>;

  // ===================== REFUND PROCESSING =====================

  /**
   * Find cancelled orders that still have PAID payment status
   * These are orders where refund processing may have failed
   */
  findCancelledOrdersNeedingRefund(): ResultAsync<Order[], DomainError>;

  // ===================== PAYMENT TIMEOUT =====================

  /**
   * Find pending orders with pending payment that were created more than X minutes ago.
   * Used by cron job to check VNPay payment status and auto-cancel timed out orders.
   * @param minutesSinceCreation - Minimum age of orders to check
   * @param limit - Maximum number of orders to return (default: 100)
   */
  findPendingOrdersForPaymentCheck(
    minutesSinceCreation: number,
    limit?: number,
  ): ResultAsync<Order[], DomainError>;
}

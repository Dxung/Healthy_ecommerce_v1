import type { ResultAsync } from 'neverthrow';
import type { DomainError } from 'src/shared/types/domain-error.type';
import type { OrderStatus } from 'src/database/typeorm/entities/order/enums/order-status.enum';
import type {
  OrderWithShopAndBuyer,
  PaginatedResult,
} from './repository/order.repository.interface';

/**
 * Admin order list filters
 */
export interface AdminOrderFilters {
  status?: OrderStatus;
  search?: string;
  shopId?: string;
  buyerId?: string;
  fromDate?: Date;
  toDate?: Date;
}

/**
 * Pagination options
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface IAdminOrderService {
  /**
   * Get all orders with pagination and filters (admin view)
   */
  getAllOrders(
    filters: AdminOrderFilters,
    pagination: PaginationParams,
  ): ResultAsync<PaginatedResult<OrderWithShopAndBuyer>, DomainError>;

  /**
   * Get single order detail (admin view)
   */
  getOrderById(
    orderId: string,
  ): ResultAsync<OrderWithShopAndBuyer, DomainError>;

  /**
   * Admin force update order status
   */
  updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    note?: string,
  ): ResultAsync<OrderWithShopAndBuyer, DomainError>;

  /**
   * Refund a specific order item (admin action)
   * Marks the item as refunded and hides any associated review.
   * @param orderItemId - The order item ID to refund
   * @param reason - The reason for the refund
   * @returns void on success
   */
  refundOrderItem(
    orderItemId: string,
    reason: string,
  ): ResultAsync<void, DomainError>;
}

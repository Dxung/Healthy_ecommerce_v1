import type { ResultAsync } from 'neverthrow';
import type { DomainError } from 'src/shared/types/domain-error.type';
import type { OrderStatus } from 'src/database/typeorm/entities/order/enums/order-status.enum';
import type { PaymentMethod } from 'src/database/typeorm/entities/order/enums/payment-method.enum';
import type {
  OrderWithShop,
  OrderWithBuyer,
  PaginatedResult,
} from './repository/order.repository.interface';
import type { Order } from './models/order.model';

/**
 * Create order input
 */
export interface CreateOrderInput {
  addressId: string;
  paymentMethod: PaymentMethod;
  useCoin?: boolean;
  coinAmount?: number;
  shopNotes?: { shopId: string; note: string }[];
}

/**
 * Create order result - includes orders and optionally payment URL for VNPay
 */
export interface CreateOrderResult {
  orders: OrderWithShop[];
  /** VNPay payment URL - present when paymentMethod is VNPAY or WALLET_VNPAY */
  paymentUrl?: string;
  /** Transaction reference for tracking payment - present when paymentMethod requires VNPay */
  txnRef?: string;
  /** Amount paid from wallet (for WALLET_VNPAY) */
  walletAmountUsed?: number;
  /** Amount to pay via VNPay (for VNPAY or WALLET_VNPAY) */
  vnpayAmount?: number;
  /** True if order is COD (Cash on Delivery) - order auto-confirmed */
  isCod?: boolean;
}

/**
 * Order list filters
 */
export interface OrderListFilters {
  status?: OrderStatus;
  fromDate?: Date;
  toDate?: Date;
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface IOrderService {
  // ===================== BUYER METHODS =====================

  /**
   * Create orders from selected cart items
   * Returns orders and payment URL if VNPay is used
   */
  createOrder(
    input: CreateOrderInput,
  ): ResultAsync<CreateOrderResult, DomainError>;

  /**
   * Get buyer's orders with pagination and filters
   */
  getMyOrders(
    filters: OrderListFilters,
    pagination: PaginationOptions,
  ): ResultAsync<PaginatedResult<OrderWithShop>, DomainError>;

  /**
   * Get single order detail for buyer
   */
  getMyOrderById(orderId: string): ResultAsync<OrderWithShop, DomainError>;

  /**
   * Cancel order (buyer)
   * Buyer can only cancel if order is pending
   */
  cancelMyOrder(
    orderId: string,
    reason?: string,
  ): ResultAsync<Order, DomainError>;

  /**
   * Confirm delivery (buyer)
   * Marks order as completed
   */
  confirmDelivery(orderId: string): ResultAsync<Order, DomainError>;

  // ===================== SHOP METHODS =====================

  /**
   * Get shop's orders with pagination and filters
   */
  getShopOrders(
    filters: OrderListFilters,
    pagination: PaginationOptions,
  ): ResultAsync<PaginatedResult<OrderWithBuyer>, DomainError>;

  /**
   * Get single order detail for shop
   */
  getShopOrderById(orderId: string): ResultAsync<OrderWithBuyer, DomainError>;

  /**
   * Confirm order (shop)
   * Moves order from pending to confirmed
   */
  confirmOrder(orderId: string): ResultAsync<Order, DomainError>;

  /**
   * Mark order as shipped (shop)
   */
  shipOrder(orderId: string): ResultAsync<Order, DomainError>;

  /**
   * Mark order as delivered (shop/system)
   */
  markDelivered(orderId: string): ResultAsync<Order, DomainError>;

  /**
   * Cancel order (shop)
   * Shop can cancel if order is pending or confirmed
   */
  cancelShopOrder(
    orderId: string,
    reason?: string,
  ): ResultAsync<Order, DomainError>;

  /**
   * Update shop note on order
   */
  updateShopNote(
    orderId: string,
    note: string | null,
  ): ResultAsync<Order, DomainError>;

  // ===================== SYSTEM/CRON METHODS =====================

  /**
   * Auto-complete delivered orders past deadline
   */
  autoCompleteOrders(): ResultAsync<number, DomainError>;

  /**
   * Process missed refunds for cancelled orders
   * Called by RefundProcessorCronjob to handle edge cases where
   * refunds were not processed during order cancellation.
   */
  processMissedRefunds(): ResultAsync<number, DomainError>;

  // ===================== PAYMENT CALLBACK METHODS =====================

  /**
   * Process successful VNPay payment for an order
   * Called by PaymentService when VNPay callback indicates success
   * Creates escrow hold and marks order as paid
   */
  processVnpayPaymentSuccess(orderId: string): ResultAsync<Order, DomainError>;

  /**
   * Process failed VNPay payment for an order
   * Called by PaymentService when VNPay callback indicates failure
   */
  processVnpayPaymentFailed(orderId: string): ResultAsync<void, DomainError>;

  /**
   * Cancel order due to payment timeout
   * Called by OrderPaymentTimeoutCronjob
   */
  cancelOrderDueToPaymentTimeout(orderId: string): ResultAsync<Order, DomainError>;
}

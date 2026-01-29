/**
 * Refund status enum for order items.
 * Tracks the refund state of individual items in an order.
 */
export enum RefundStatus {
  /** Item has not been refunded */
  NONE = 'none',

  /** Refund is pending/in progress */
  PENDING = 'pending',

  /** Item has been fully refunded */
  REFUNDED = 'refunded',
}

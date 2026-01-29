/**
 * Review status enum.
 * Determines visibility and state of a review.
 */
export enum ReviewStatus {
  /** Review is visible and counted in ratings */
  ACTIVE = 'active',

  /** Review is hidden because the order item was refunded */
  HIDDEN_DUE_TO_REFUND = 'hidden_due_to_refund',

  /** Review was soft-deleted by the user */
  DELETED = 'deleted',
}

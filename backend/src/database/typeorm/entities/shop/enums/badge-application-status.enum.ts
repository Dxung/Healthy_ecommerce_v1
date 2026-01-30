/**
 * Badge application status enum.
 * Maps to shop_schema.badge_application_status_enum in PostgreSQL.
 */
export enum BadgeApplicationStatus {
  /** Application is pending review */
  PENDING = 'pending',

  /** Application has been approved */
  APPROVED = 'approved',

  /** Application has been rejected */
  REJECTED = 'rejected',

  /** Application has been cancelled by shop owner */
  CANCELLED = 'cancelled',
}

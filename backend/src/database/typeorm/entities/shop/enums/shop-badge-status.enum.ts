/**
 * Shop badge status enum.
 * Maps to shop_schema.badge_status_enum in PostgreSQL.
 */
export enum ShopBadgeStatus {
  /** Badge is active and visible */
  ACTIVE = 'active',

  /** Badge has been disabled */
  DISABLED = 'disabled',
}

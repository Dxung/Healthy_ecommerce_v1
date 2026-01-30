/**
 * Badge application type enum.
 * Maps to shop_schema.badge_application_type_enum in PostgreSQL.
 */
export enum BadgeApplicationType {
  /** Application for Verified badge (shop xác thực) */
  VERIFIED = 'verified',

  /** Application for Official badge (đại lý chính hãng per brand) */
  OFFICIAL = 'official',
}

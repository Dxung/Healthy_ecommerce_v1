/**
 * Shop badge code enum representing the type of verification badge.
 * Maps to shop_schema.badge_code_enum in PostgreSQL.
 *
 * Badge types:
 * - PREFERRED: Shop has achieved preferred status through performance metrics
 * - APPROVED: Shop has submitted valid business documents (verified business)
 * - OFFICIAL: Shop is an official representative of a brand
 */
export enum ShopBadgeCode {
  /** Preferred shop based on performance metrics */
  PREFERRED = 'preferred',

  /** Verified business with approved documents */
  APPROVED = 'approved',

  /** Official brand representative */
  OFFICIAL = 'official',
}

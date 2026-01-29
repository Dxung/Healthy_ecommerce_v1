/**
 * Shop badge type enum representing the type of verification badge.
 *
 * Badge types:
 * - APPROVED: Shop has submitted valid business documents (verified business)
 * - OFFICIAL: Shop is an official representative of a brand
 */
export enum ShopBadgeType {
  /** Verified business with approved documents */
  APPROVED = 'approved',

  /** Official brand representative */
  OFFICIAL = 'official',
}

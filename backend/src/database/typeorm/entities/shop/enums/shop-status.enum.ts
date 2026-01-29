/**
 * Shop status enum representing the current state of a shop.
 *
 * Status transitions:
 * - ACTIVE: Default after creation, shop can sell and is visible
 * - INACTIVE: Owner voluntarily hides shop (can reactivate)
 * - SUSPENDED: Admin blocks shop or shop has debt (can be unsuspended)
 * - BANNED: Permanently banned by admin (cannot recover)
 */
export enum ShopStatus {
  /** Shop is active and can sell products */
  ACTIVE = 'active',

  /** Shop owner set to not show online (voluntary) */
  INACTIVE = 'inactive',

  /** Shop is suspended by admin or due to debt */
  SUSPENDED = 'suspended',

  /** Shop is permanently banned by admin */
  BANNED = 'banned',
}

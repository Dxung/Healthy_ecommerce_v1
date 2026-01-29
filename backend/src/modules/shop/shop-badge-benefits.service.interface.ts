import type { ResultAsync } from 'neverthrow';
import type { DomainError } from 'src/shared/types/domain-error.type';

/**
 * Aggregated badge benefits for a shop.
 */
export interface ShopBadgeBenefits {
  /** Highest platform fee discount percent from all active badges (0 if none) */
  platformFeeDiscountPercent: number;
  /** Highest search boost multiplier from all active badges (1 if none) */
  searchBoostMultiplier: number;
  /** Highest max product slots from all active badges (null = unlimited) */
  maxProductSlots: number | null;
}

/**
 * Service interface for retrieving badge benefits for shops.
 * Aggregates benefits from all active badges assigned to a shop.
 */
export interface IShopBadgeBenefitsService {
  /**
   * Gets all aggregated badge benefits for a shop.
   * Returns the highest value for each benefit type from all active badges.
   * @param shopId - The shop ID
   * @returns Aggregated badge benefits
   */
  getShopBadgeBenefits(
    shopId: string,
  ): ResultAsync<ShopBadgeBenefits, DomainError>;

  /**
   * Gets the effective platform fee discount percent for a shop.
   * Returns the highest discount from all active badges.
   * @param shopId - The shop ID
   * @returns Discount percent (0 if no discount)
   */
  getEffectivePlatformFeeDiscount(
    shopId: string,
  ): ResultAsync<number, DomainError>;

  /**
   * Gets the effective search boost multiplier for a shop.
   * Returns the highest multiplier from all active badges.
   * @param shopId - The shop ID
   * @returns Boost multiplier (1 if no boost)
   */
  getEffectiveSearchBoost(shopId: string): ResultAsync<number, DomainError>;

  /**
   * Gets the effective max product slots for a shop.
   * Returns the highest limit from all active badges.
   * @param shopId - The shop ID
   * @returns Max slots (null if unlimited)
   */
  getEffectiveMaxProductSlots(
    shopId: string,
  ): ResultAsync<number | null, DomainError>;
}

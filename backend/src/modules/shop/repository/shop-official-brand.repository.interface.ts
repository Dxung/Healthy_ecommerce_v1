import type { ResultAsync } from 'neverthrow';
import type { DomainError } from 'src/shared/types/domain-error.type';
import type { ShopOfficialBrand } from '../models/shop-official-brand.model';

/**
 * Repository interface for ShopOfficialBrand entity operations.
 */
export interface IShopOfficialBrandRepository {
  /**
   * Creates a new shop official brand record.
   */
  create(officialBrand: ShopOfficialBrand): ResultAsync<ShopOfficialBrand, DomainError>;

  /**
   * Finds by shop ID and brand ID.
   */
  findByShopAndBrand(
    shopId: string,
    brandId: string,
  ): ResultAsync<ShopOfficialBrand | null, DomainError>;

  /**
   * Checks if shop is official for a brand (active, not expired, not revoked).
   */
  isOfficialForBrand(shopId: string, brandId: string): ResultAsync<boolean, DomainError>;

  /**
   * Finds all active official brands for a shop.
   */
  findActiveByShop(shopId: string): ResultAsync<ShopOfficialBrand[], DomainError>;

  /**
   * Finds all brand IDs that shop is official for (active, not expired).
   */
  findActiveBrandIdsByShop(shopId: string): ResultAsync<string[], DomainError>;

  /**
   * Updates an official brand record.
   */
  update(officialBrand: ShopOfficialBrand): ResultAsync<ShopOfficialBrand, DomainError>;

  /**
   * Finds all expired but not yet revoked official brands (for cronjob).
   */
  findExpiredNotRevoked(): ResultAsync<ShopOfficialBrand[], DomainError>;

  /**
   * Checks if shop has any active (non-expired, non-revoked) official brands.
   */
  hasAnyActiveOfficialBrand(shopId: string): ResultAsync<boolean, DomainError>;
}

import type { ResultAsync } from 'neverthrow';
import type { ProductVariant } from '../models/product-variant.model';
import type { DomainError } from 'src/shared/types/domain-error.type';

/**
 * Variant with product information for cart operations
 */
export interface VariantWithProduct {
  id: string;
  productId: string;
  sku: string | null;
  name: string;
  price: number;
  compareAtPrice: number | null;
  stockQuantity: number;
  imageUrl: string | null;
  isActive: boolean;
  deletedAt: Date | null;
  expiryDate: Date | null;
  product: {
    id: string;
    shopId: string;
    name: string;
    slug: string;
    thumbnailUrl: string;
    isVisible: boolean;
    status: string;
  };
}

export interface IProductVariantRepository {
  /**
   * Adds a variant to a product.
   * @param variant - The ProductVariant domain model to add.
   * @returns The created ProductVariant domain model.
   */
  addVariant(variant: ProductVariant): ResultAsync<ProductVariant, DomainError>;

  /**
   * Updates an existing variant.
   * @param variant - The ProductVariant domain model with updated fields.
   * @returns The updated ProductVariant domain model.
   */
  updateVariant(
    variant: ProductVariant,
  ): ResultAsync<ProductVariant, DomainError>;

  /**
   * Soft deletes a variant.
   * @param variantId - The variant ID to delete.
   * @returns void on success.
   */
  softDeleteVariant(variantId: string): ResultAsync<void, DomainError>;

  /**
   * Gets all variants for a product.
   * @param productId - The product ID.
   * @returns Array of ProductVariant domain models.
   */
  getVariants(productId: string): ResultAsync<ProductVariant[], DomainError>;

  /**
   * Finds a variant by its ID.
   * @param variantId - The variant ID.
   * @returns The ProductVariant domain model or null if not found.
   */
  findById(variantId: string): ResultAsync<ProductVariant | null, DomainError>;

  /**
   * Gets the count of active variants for a product.
   * @param productId - The product ID.
   * @returns The number of active variants.
   */
  getActiveVariantCount(productId: string): ResultAsync<number, DomainError>;

  /**
   * Links a variant to option values.
   * @param variantId - The variant ID.
   * @param optionValueIds - Array of option value IDs.
   * @returns void on success.
   */
  setVariantOptionValues(
    variantId: string,
    optionValueIds: string[],
  ): ResultAsync<void, DomainError>;

  /**
   * Deletes all variants for a product.
   * @param productId - The product ID.
   * @returns void on success.
   */
  deleteByProductId(productId: string): ResultAsync<void, DomainError>;

  /**
   * Finds a variant by ID with its product information.
   * Used by cart operations to validate product availability.
   * @param variantId - The variant ID.
   * @returns VariantWithProduct or null if not found.
   */
  findByIdWithProduct(
    variantId: string,
  ): ResultAsync<VariantWithProduct | null, DomainError>;

  /**
   * Deduct stock for multiple variants with pessimistic lock.
   * Must be called within a transaction context.
   * @param items - Array of { variantId, quantity } to deduct.
   * @returns void on success, error if insufficient stock or variant not found.
   */
  deductStockWithLock(
    items: Array<{ variantId: string; quantity: number }>,
  ): ResultAsync<void, DomainError>;

  /**
   * Restore stock for multiple variants.
   * Used when order is cancelled to return stock to inventory.
   * @param items - Array of { variantId, quantity } to restore.
   * @returns void on success.
   */
  restoreStock(
    items: Array<{ variantId: string; quantity: number }>,
  ): ResultAsync<void, DomainError>;
}

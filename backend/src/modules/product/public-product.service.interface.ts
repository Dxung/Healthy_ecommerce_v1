import type { ResultAsync } from 'neverthrow';
import type { Product } from './models/product.model';
import type { DomainError } from 'src/shared/types/domain-error.type';
import type {
  PaginatedResult,
  PaginationParams,
} from 'src/shared/types/pagination.type';
import type { VariantWithProduct } from './repository/product-variant.repository.interface';

/**
 * Filter options for public product queries.
 */
export interface PublicProductFilter {
  search?: string;
  categoryId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'best_selling' | 'rating';
  /** Filter products that have ALL specified diet tags */
  dietTagIds?: string[];
  /** Filter OUT products that have ANY of these allergen tags (allergen-free filter) */
  allergenFreeIds?: string[];
}

export interface IPublicProductService {
  /**
   * Browse active products with optional filters.
   * Only returns products with status 'active' and isVisible = true.
   * @param filter - Optional filter criteria.
   * @param pagination - Pagination parameters.
   * @returns Paginated list of products.
   */
  browseProducts(
    filter?: PublicProductFilter,
    pagination?: PaginationParams,
  ): ResultAsync<PaginatedResult<Product>, DomainError>;

  /**
   * Gets a product by ID for public viewing.
   * Only returns if product is active and visible.
   * @param productId - The product ID.
   * @returns The product with images, options, and variants.
   */
  getProductById(productId: string): ResultAsync<Product, DomainError>;

  /**
   * Gets a product by slug for public viewing.
   * Only returns if product is active and visible.
   * @param slug - The product slug.
   * @returns The product with images, options, and variants.
   */
  getProductBySlug(slug: string): ResultAsync<Product, DomainError>;

  /**
   * Gets products by category (including subcategories).
   * @param categoryId - The category ID.
   * @param pagination - Pagination parameters.
   * @returns Paginated list of products.
   */
  getProductsByCategory(
    categoryId: string,
    pagination?: PaginationParams,
  ): ResultAsync<PaginatedResult<Product>, DomainError>;

  /**
   * Gets products by brand.
   * @param brandId - The brand ID.
   * @param pagination - Pagination parameters.
   * @returns Paginated list of products.
   */
  getProductsByBrand(
    brandId: string,
    pagination?: PaginationParams,
  ): ResultAsync<PaginatedResult<Product>, DomainError>;

  /**
   * Gets products by shop.
   * @param shopId - The shop ID.
   * @param pagination - Pagination parameters.
   * @returns Paginated list of products.
   */
  getProductsByShop(
    shopId: string,
    pagination?: PaginationParams,
  ): ResultAsync<PaginatedResult<Product>, DomainError>;

  /**
   * Gets variant with product info for cart operations.
   * Used to validate variant availability when adding to cart.
   * @param variantId - The variant ID.
   * @returns Variant with product info or null if not found.
   */
  getVariantForCart(
    variantId: string,
  ): ResultAsync<VariantWithProduct | null, DomainError>;
}

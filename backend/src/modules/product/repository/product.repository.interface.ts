import type { ResultAsync } from 'neverthrow';
import type { Product } from '../models/product.model';
import type { DomainError } from 'src/shared/types/domain-error.type';
import type {
  PaginationParams,
  PaginatedResult,
} from 'src/shared/types/pagination.type';
import type { ProductStatus } from 'src/database/typeorm/entities/product/enums/product-status.enum';

/**
 * Filter options for querying products (admin/shop owner).
 */
export interface ProductFilter {
  shopId?: string;
  categoryId?: string;
  brandId?: string;
  status?: ProductStatus;
  isVisible?: boolean;
  search?: string;
}

/**
 * Filter options for public product browsing.
 */
export interface PublicProductFilter {
  categoryId?: string;
  /** Filter by multiple category IDs (for including subcategories). Takes precedence over categoryId if both provided. */
  categoryIds?: string[];
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'best_selling' | 'rating';
  /** Filter products that have ALL specified diet tags */
  dietTagIds?: string[];
  /** Filter OUT products that have ANY of these allergen tags (allergen-free filter) */
  allergenFreeIds?: string[];
}

/**
 * Options for loading product relations.
 */
export interface ProductLoadOptions {
  withImages?: boolean;
  withOptions?: boolean;
  withVariants?: boolean;
  withUnits?: boolean;
}

export interface IProductRepository {
  /**
   * Finds a product by its ID with optional relations.
   * @param id - The product ID.
   * @param options - Optional relation loading options.
   * @returns The Product domain model or null if not found.
   */
  findById(
    id: string,
    options?: ProductLoadOptions,
  ): ResultAsync<Product | null, DomainError>;

  /**
   * Finds a product by slug within a specific shop.
   * @param shopId - The shop ID.
   * @param slug - The product slug.
   * @param options - Optional relation loading options.
   * @returns The Product domain model or null if not found.
   */
  findBySlugAndShop(
    shopId: string,
    slug: string,
    options?: ProductLoadOptions,
  ): ResultAsync<Product | null, DomainError>;

  /**
   * Finds all products for a shop with pagination.
   * @param shopId - The shop ID.
   * @param pagination - Pagination parameters.
   * @param filter - Optional filter criteria.
   * @returns Paginated list of Product domain models.
   */
  findByShopId(
    shopId: string,
    pagination: PaginationParams,
    filter?: Omit<ProductFilter, 'shopId'>,
  ): ResultAsync<PaginatedResult<Product>, DomainError>;

  /**
   * Finds all products with pagination (admin view).
   * @param pagination - Pagination parameters.
   * @param filter - Optional filter criteria.
   * @returns Paginated list of Product domain models.
   */
  findAll(
    pagination: PaginationParams,
    filter?: ProductFilter,
  ): ResultAsync<PaginatedResult<Product>, DomainError>;

  /**
   * Finds all active/visible products for public browsing.
   * @param pagination - Pagination parameters.
   * @param filter - Optional filter criteria.
   * @returns Paginated list of Product domain models.
   */
  findPublic(
    pagination: PaginationParams,
    filter?: PublicProductFilter,
  ): ResultAsync<PaginatedResult<Product>, DomainError>;

  /**
   * Checks if a slug exists for a shop (excluding a specific product ID).
   * @param shopId - The shop ID.
   * @param slug - The slug to check.
   * @param excludeId - Optional product ID to exclude from the check.
   * @returns True if slug exists, false otherwise.
   */
  slugExistsInShop(
    shopId: string,
    slug: string,
    excludeId?: string,
  ): ResultAsync<boolean, DomainError>;

  /**
   * Creates a new product.
   * @param product - The Product domain model to create.
   * @returns The created Product domain model.
   */
  create(product: Product): ResultAsync<Product, DomainError>;

  /**
   * Updates an existing product's basic info.
   * @param product - The Product domain model with updated fields.
   * @returns The updated Product domain model.
   */
  update(product: Product): ResultAsync<Product, DomainError>;

  /**
   * Soft deletes a product.
   * @param id - The product ID to delete.
   * @returns void on success.
   */
  softDelete(id: string): ResultAsync<void, DomainError>;

  /**
   * Hard deletes a product (admin only).
   * @param id - The product ID to delete.
   * @returns void on success.
   */
  hardDelete(id: string): ResultAsync<void, DomainError>;

  /**
   * Counts active (non-deleted) products for a shop.
   * @param shopId - The shop ID.
   * @returns The count of active products.
   */
  countActiveByShopId(shopId: string): ResultAsync<number, DomainError>;

  /**
   * Updates the average rating and total ratings for a product.
   * @param productId - The product ID.
   * @param averageRating - The new average rating.
   * @param totalRatings - The new total count of ratings.
   * @returns void on success.
   */
  updateRating(
    productId: string,
    averageRating: number,
    totalRatings: number,
  ): ResultAsync<void, DomainError>;
}

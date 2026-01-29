import type { ResultAsync } from 'neverthrow';
import type { Product } from './models/product.model';
import type { DomainError } from 'src/shared/types/domain-error.type';
import type { PaginatedResult, PaginationParams } from 'src/shared/types/pagination.type';
import type { ProductStatus } from 'src/database/typeorm/entities/product/enums/product-status.enum';

/**
 * Filter options for admin product queries.
 */
export interface AdminProductFilter {
  search?: string;
  categoryId?: string;
  brandId?: string;
  shopId?: string;
  status?: ProductStatus;
}

export interface IAdminProductService {
  /**
   * Gets all products with optional filters.
   * @param filter - Optional filter criteria.
   * @param pagination - Pagination parameters.
   * @returns Paginated list of products.
   */
  getAllProducts(
    filter?: AdminProductFilter,
    pagination?: PaginationParams,
  ): ResultAsync<PaginatedResult<Product>, DomainError>;

  /**
   * Gets a product by ID with full details.
   * @param productId - The product ID.
   * @returns The product with images, options, and variants.
   */
  getProductById(productId: string): ResultAsync<Product, DomainError>;

  /**
   * Force deletes a product (hard delete).
   * @param productId - The product ID.
   * @returns void on success.
   */
  forceDeleteProduct(productId: string): ResultAsync<void, DomainError>;
}

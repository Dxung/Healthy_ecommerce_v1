import type { ResultAsync } from 'neverthrow';
import type { ProductOption } from '../models/product-option.model';
import type { DomainError } from 'src/shared/types/domain-error.type';

export interface IProductOptionRepository {
  /**
   * Sets the options for a product (replaces existing).
   * @param productId - The product ID.
   * @param options - Array of ProductOption domain models.
   * @returns void on success.
   */
  setOptions(
    productId: string,
    options: ProductOption[],
  ): ResultAsync<void, DomainError>;

  /**
   * Gets all options for a product with their values.
   * @param productId - The product ID.
   * @returns Array of ProductOption domain models with values.
   */
  getOptions(productId: string): ResultAsync<ProductOption[], DomainError>;

  /**
   * Deletes all options for a product.
   * @param productId - The product ID.
   * @returns void on success.
   */
  deleteByProductId(productId: string): ResultAsync<void, DomainError>;
}

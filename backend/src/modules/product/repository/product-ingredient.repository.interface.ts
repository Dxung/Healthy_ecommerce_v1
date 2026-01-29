import type { ResultAsync } from 'neverthrow';
import type { ProductIngredient } from '../models/product-ingredient.model';
import type { DomainError } from 'src/shared/types/domain-error.type';

export interface IProductIngredientRepository {
  /**
   * Sets ingredients for a product (replaces all existing).
   * @param productId - The product ID.
   * @param ingredients - Array of ProductIngredient domain models.
   * @returns void on success.
   */
  setIngredients(
    productId: string,
    ingredients: ProductIngredient[],
  ): ResultAsync<void, DomainError>;

  /**
   * Gets all ingredients for a product.
   * @param productId - The product ID.
   * @returns Array of ProductIngredient domain models.
   */
  findByProductId(
    productId: string,
  ): ResultAsync<ProductIngredient[], DomainError>;

  /**
   * Deletes all ingredients for a product.
   * @param productId - The product ID.
   * @returns void on success.
   */
  deleteByProductId(productId: string): ResultAsync<void, DomainError>;
}

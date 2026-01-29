import type { ResultAsync } from 'neverthrow';
import type { ProductNutrition } from '../models/product-nutrition.model';
import type { DomainError } from 'src/shared/types/domain-error.type';

export interface IProductNutritionRepository {
  /**
   * Finds nutrition info by product ID.
   */
  findByProductId(productId: string): ResultAsync<ProductNutrition | null, DomainError>;

  /**
   * Finds nutrition info by its ID.
   */
  findById(id: string): ResultAsync<ProductNutrition | null, DomainError>;

  /**
   * Creates nutrition info for a product.
   */
  create(nutrition: ProductNutrition): ResultAsync<ProductNutrition, DomainError>;

  /**
   * Updates existing nutrition info.
   */
  update(nutrition: ProductNutrition): ResultAsync<ProductNutrition, DomainError>;

  /**
   * Deletes nutrition info by product ID.
   */
  deleteByProductId(productId: string): ResultAsync<void, DomainError>;

  /**
   * Finds nutrition info for multiple products.
   */
  findByProductIds(productIds: string[]): ResultAsync<ProductNutrition[], DomainError>;
}

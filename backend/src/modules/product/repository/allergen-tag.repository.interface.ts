import type { ResultAsync } from 'neverthrow';
import type { AllergenTag } from '../models/allergen-tag.model';
import type { DomainError } from 'src/shared/types/domain-error.type';

/**
 * Filter options for querying allergen tags.
 */
export interface AllergenTagFilter {
  isActive?: boolean;
  search?: string;
}

export interface IAllergenTagRepository {
  /**
   * Finds an allergen tag by its ID.
   * @param id - The allergen tag ID.
   * @returns The AllergenTag domain model or null if not found.
   */
  findById(id: string): ResultAsync<AllergenTag | null, DomainError>;

  /**
   * Finds an allergen tag by its slug.
   * @param slug - The allergen tag slug.
   * @returns The AllergenTag domain model or null if not found.
   */
  findBySlug(slug: string): ResultAsync<AllergenTag | null, DomainError>;

  /**
   * Finds all allergen tags matching the filter criteria.
   * @param filter - Optional filter criteria.
   * @returns Array of AllergenTag domain models.
   */
  findAll(filter?: AllergenTagFilter): ResultAsync<AllergenTag[], DomainError>;

  /**
   * Creates a new allergen tag.
   * @param allergenTag - The AllergenTag domain model to create.
   * @returns The created AllergenTag domain model.
   */
  create(allergenTag: AllergenTag): ResultAsync<AllergenTag, DomainError>;

  /**
   * Updates an existing allergen tag.
   * @param allergenTag - The AllergenTag domain model with updated fields.
   * @returns The updated AllergenTag domain model.
   */
  update(allergenTag: AllergenTag): ResultAsync<AllergenTag, DomainError>;

  /**
   * Soft deletes an allergen tag by ID.
   * Products keep the allergen tag but it becomes hidden.
   * The slug becomes available for reuse after deletion.
   * @param id - The allergen tag ID to soft delete.
   * @returns void on success.
   */
  softDelete(id: string): ResultAsync<void, DomainError>;

  /**
   * Checks if a slug already exists (excluding a specific allergen tag ID).
   * @param slug - The slug to check.
   * @param excludeId - Optional allergen tag ID to exclude from the check.
   * @returns True if slug exists, false otherwise.
   */
  slugExists(
    slug: string,
    excludeId?: string,
  ): ResultAsync<boolean, DomainError>;

  /**
   * Checks if an allergen tag is used by any products.
   * @param allergenTagId - The allergen tag ID to check.
   * @returns True if in use, false otherwise.
   */
  isInUse(allergenTagId: string): ResultAsync<boolean, DomainError>;

  /**
   * Finds all allergen tags for a specific product.
   * @param productId - The product ID.
   * @returns Array of AllergenTag domain models.
   */
  findByProductId(productId: string): ResultAsync<AllergenTag[], DomainError>;

  /**
   * Sets allergen tags for a product (replaces existing).
   * @param productId - The product ID.
   * @param allergenTagIds - Array of allergen tag IDs to set.
   * @returns void on success.
   */
  setProductAllergenTags(
    productId: string,
    allergenTagIds: string[],
  ): ResultAsync<void, DomainError>;
}

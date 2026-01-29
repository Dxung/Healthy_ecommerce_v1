import type { ResultAsync } from 'neverthrow';
import type { DietTag } from '../models/diet-tag.model';
import type { DomainError } from 'src/shared/types/domain-error.type';

/**
 * Filter options for querying diet tags.
 */
export interface DietTagFilter {
  isActive?: boolean;
  search?: string;
}

export interface IDietTagRepository {
  /**
   * Finds a diet tag by its ID.
   * @param id - The diet tag ID.
   * @returns The DietTag domain model or null if not found.
   */
  findById(id: string): ResultAsync<DietTag | null, DomainError>;

  /**
   * Finds a diet tag by its slug.
   * @param slug - The diet tag slug.
   * @returns The DietTag domain model or null if not found.
   */
  findBySlug(slug: string): ResultAsync<DietTag | null, DomainError>;

  /**
   * Finds all diet tags matching the filter criteria.
   * @param filter - Optional filter criteria.
   * @returns Array of DietTag domain models.
   */
  findAll(filter?: DietTagFilter): ResultAsync<DietTag[], DomainError>;

  /**
   * Creates a new diet tag.
   * @param dietTag - The DietTag domain model to create.
   * @returns The created DietTag domain model.
   */
  create(dietTag: DietTag): ResultAsync<DietTag, DomainError>;

  /**
   * Updates an existing diet tag.
   * @param dietTag - The DietTag domain model with updated fields.
   * @returns The updated DietTag domain model.
   */
  update(dietTag: DietTag): ResultAsync<DietTag, DomainError>;

  /**
   * Soft deletes a diet tag by ID.
   * Products keep the diet tag but it becomes hidden.
   * The slug becomes available for reuse after deletion.
   * @param id - The diet tag ID to soft delete.
   * @returns void on success.
   */
  softDelete(id: string): ResultAsync<void, DomainError>;

  /**
   * Checks if a slug already exists (excluding a specific diet tag ID).
   * @param slug - The slug to check.
   * @param excludeId - Optional diet tag ID to exclude from the check.
   * @returns True if slug exists, false otherwise.
   */
  slugExists(
    slug: string,
    excludeId?: string,
  ): ResultAsync<boolean, DomainError>;

  /**
   * Checks if a diet tag is used by any products.
   * @param dietTagId - The diet tag ID to check.
   * @returns True if in use, false otherwise.
   */
  isInUse(dietTagId: string): ResultAsync<boolean, DomainError>;
}

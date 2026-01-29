import type { ResultAsync } from 'neverthrow';
import type { Brand } from '../models/brand.model';
import type { DomainError } from 'src/shared/types/domain-error.type';

/**
 * Filter options for querying brands.
 */
export interface BrandFilter {
  isActive?: boolean;
  search?: string;
}

export interface IBrandRepository {
  /**
   * Finds a brand by its ID.
   * @param id - The brand ID.
   * @returns The Brand domain model or null if not found.
   */
  findById(id: string): ResultAsync<Brand | null, DomainError>;

  /**
   * Finds a brand by its slug.
   * @param slug - The brand slug.
   * @returns The Brand domain model or null if not found.
   */
  findBySlug(slug: string): ResultAsync<Brand | null, DomainError>;

  /**
   * Finds all brands matching the filter criteria.
   * @param filter - Optional filter criteria.
   * @returns Array of Brand domain models.
   */
  findAll(filter?: BrandFilter): ResultAsync<Brand[], DomainError>;

  /**
   * Creates a new brand.
   * @param brand - The Brand domain model to create.
   * @returns The created Brand domain model.
   */
  create(brand: Brand): ResultAsync<Brand, DomainError>;

  /**
   * Updates an existing brand.
   * @param brand - The Brand domain model with updated fields.
   * @returns The updated Brand domain model.
   */
  update(brand: Brand): ResultAsync<Brand, DomainError>;

  /**
   * Soft deletes a brand.
   * @param id - The brand ID to delete.
   * @returns void on success.
   */
  softDelete(id: string): ResultAsync<void, DomainError>;

  /**
   * Checks if a brand has any products assigned to it.
   * @param brandId - The brand ID to check.
   * @returns True if brand has products, false otherwise.
   */
  hasProducts(brandId: string): ResultAsync<boolean, DomainError>;

  /**
   * Checks if a slug already exists (excluding a specific brand ID).
   * @param slug - The slug to check.
   * @param excludeId - Optional brand ID to exclude from the check.
   * @returns True if slug exists, false otherwise.
   */
  slugExists(slug: string, excludeId?: string): ResultAsync<boolean, DomainError>;
}

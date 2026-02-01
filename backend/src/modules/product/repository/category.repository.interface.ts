import type { ResultAsync } from 'neverthrow';
import type { Category } from '../models/category.model';
import type { DomainError } from 'src/shared/types/domain-error.type';

/**
 * Filter options for querying categories.
 */
export interface CategoryFilter {
  parentId?: string | null;
  isActive?: boolean;
  level?: number;
}

export interface ICategoryRepository {
  /**
   * Finds a category by its ID.
   * @param id - The category ID.
   * @returns The Category domain model or null if not found.
   */
  findById(id: string): ResultAsync<Category | null, DomainError>;

  /**
   * Finds a category by its slug.
   * @param slug - The category slug.
   * @returns The Category domain model or null if not found.
   */
  findBySlug(slug: string): ResultAsync<Category | null, DomainError>;

  /**
   * Finds all categories matching the filter criteria.
   * @param filter - Optional filter criteria.
   * @returns Array of Category domain models.
   */
  findAll(filter?: CategoryFilter): ResultAsync<Category[], DomainError>;

  /**
   * Finds all root categories (no parent) with their children loaded.
   * Used for building category hierarchy/tree.
   * @param activeOnly - If true, only returns active categories. Default true.
   * @returns Array of root Category domain models with children populated.
   */
  findHierarchy(activeOnly?: boolean): ResultAsync<Category[], DomainError>;

  /**
   * Finds direct children of a category.
   * @param parentId - The parent category ID.
   * @returns Array of child Category domain models.
   */
  findByParentId(parentId: string): ResultAsync<Category[], DomainError>;

  /**
   * Creates a new category.
   * @param category - The Category domain model to create.
   * @returns The created Category domain model.
   */
  create(category: Category): ResultAsync<Category, DomainError>;

  /**
   * Updates an existing category.
   * @param category - The Category domain model with updated fields.
   * @returns The updated Category domain model.
   */
  update(category: Category): ResultAsync<Category, DomainError>;

  /**
   * Soft deletes a category.
   * @param id - The category ID to delete.
   * @returns void on success.
   */
  softDelete(id: string): ResultAsync<void, DomainError>;

  /**
   * Checks if a category has any products assigned to it.
   * @param categoryId - The category ID to check.
   * @returns True if category has products, false otherwise.
   */
  hasProducts(categoryId: string): ResultAsync<boolean, DomainError>;

  /**
   * Checks if a category has any child categories.
   * @param categoryId - The category ID to check.
   * @returns True if category has children, false otherwise.
   */
  hasChildren(categoryId: string): ResultAsync<boolean, DomainError>;

  /**
   * Checks if a slug already exists (excluding a specific category ID).
   * @param slug - The slug to check.
   * @param excludeId - Optional category ID to exclude from the check.
   * @returns True if slug exists, false otherwise.
   */
  slugExists(
    slug: string,
    excludeId?: string,
  ): ResultAsync<boolean, DomainError>;

  /**
   * Finds all descendant IDs of a category (children, grandchildren, etc.).
   * @param categoryId - The root category ID.
   * @returns Array of descendant category IDs.
   */
  findDescendantIds(categoryId: string): ResultAsync<string[], DomainError>;

  /**
   * Soft deletes a category and all its descendants.
   * @param categoryId - The root category ID to delete.
   * @returns void on success.
   */
  softDeleteWithDescendants(categoryId: string): ResultAsync<void, DomainError>;

  /**
   * Finds all ancestor categories from root to the given category (inclusive).
   * Returns path in order: [root, ..., parent, category].
   * @param categoryId - The category ID.
   * @returns Array of ancestor Category domain models in hierarchical order.
   */
  findAncestors(categoryId: string): ResultAsync<Category[], DomainError>;

  /**
   * Updates the active status of a category and all its descendants.
   * @param categoryId - The root category ID.
   * @param isActive - The new active status.
   * @returns void on success.
   */
  updateActiveStatusWithDescendants(
    categoryId: string,
    isActive: boolean,
  ): ResultAsync<void, DomainError>;
}

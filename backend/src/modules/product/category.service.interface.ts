import type { ResultAsync } from 'neverthrow';
import type { Category } from './models/category.model';
import type { DomainError } from 'src/shared/types/domain-error.type';
import type { CreateCategoryArgumentDto } from './dto/category/create-category-argument.dto';
import type { UpdateCategoryArgumentDto } from './dto/category/update-category-argument.dto';

export interface ICategoryService {
  // ======================== ADMIN OPERATIONS ========================

  /**
   * Gets all categories with optional filter.
   * @param activeOnly - If true, returns only active categories.
   * @returns Array of Category domain models.
   */
  getAllCategories(activeOnly?: boolean): ResultAsync<Category[], DomainError>;

  /**
   * Gets a category by its ID.
   * @param id - The category ID.
   * @returns The Category domain model.
   */
  getCategoryById(id: string): ResultAsync<Category, DomainError>;

  /**
   * Creates a new category.
   * @param dto - The create category DTO.
   * @returns The created Category domain model.
   */
  createCategory(
    dto: CreateCategoryArgumentDto,
  ): ResultAsync<Category, DomainError>;

  /**
   * Updates an existing category.
   * @param id - The category ID.
   * @param dto - The update category DTO.
   * @returns The updated Category domain model.
   */
  updateCategory(
    id: string,
    dto: UpdateCategoryArgumentDto,
  ): ResultAsync<Category, DomainError>;

  /**
   * Deletes a category and all its descendants (soft delete).
   * @param id - The category ID.
   * @returns void on success.
   */
  deleteCategory(id: string): ResultAsync<void, DomainError>;

  /**
   * Toggles the active status of a single category (no cascade).
   * @param id - The category ID.
   * @param isActive - The new active status.
   * @returns The updated Category domain model.
   */
  toggleCategoryStatus(
    id: string,
    isActive: boolean,
  ): ResultAsync<Category, DomainError>;

  // ======================== PUBLIC OPERATIONS ========================

  /**
   * Gets category hierarchy (tree structure).
   * @param activeOnly - If true, only returns active categories. Default true.
   * @returns Array of root Category domain models with children populated.
   */
  getCategoryHierarchy(activeOnly?: boolean): ResultAsync<Category[], DomainError>;

  /**
   * Gets a category by its slug.
   * @param slug - The category slug.
   * @returns The Category domain model.
   */
  getCategoryBySlug(slug: string): ResultAsync<Category, DomainError>;
}

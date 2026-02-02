import type { ResultAsync } from 'neverthrow';
import type { DietTag } from './models/diet-tag.model';
import type { DomainError } from 'src/shared/types/domain-error.type';
import type { CreateDietTagArgumentDto } from './dto/diet-tag/create-diet-tag-argument.dto';
import type { UpdateDietTagArgumentDto } from './dto/diet-tag/update-diet-tag-argument.dto';

export interface IDietTagService {
  // ======================== ADMIN OPERATIONS ========================

  /**
   * Gets all diet tags with optional filter.
   * @param activeOnly - If true, returns only active diet tags.
   * @returns Array of DietTag domain models.
   */
  getAllDietTags(activeOnly?: boolean): ResultAsync<DietTag[], DomainError>;

  /**
   * Gets a diet tag by its ID.
   * @param id - The diet tag ID.
   * @returns The DietTag domain model.
   */
  getDietTagById(id: string): ResultAsync<DietTag, DomainError>;

  /**
   * Creates a new diet tag.
   * @param dto - The create diet tag DTO.
   * @returns The created DietTag domain model.
   */
  createDietTag(
    dto: CreateDietTagArgumentDto,
  ): ResultAsync<DietTag, DomainError>;

  /**
   * Updates an existing diet tag.
   * @param id - The diet tag ID.
   * @param dto - The update diet tag DTO.
   * @returns The updated DietTag domain model.
   */
  updateDietTag(
    id: string,
    dto: UpdateDietTagArgumentDto,
  ): ResultAsync<DietTag, DomainError>;

  /**
   * Deletes a diet tag.
   * @param id - The diet tag ID.
   * @returns void on success.
   */
  deleteDietTag(id: string): ResultAsync<void, DomainError>;

  // ======================== PUBLIC OPERATIONS ========================

  /**
   * Gets a diet tag by its slug.
   * @param slug - The diet tag slug.
   * @returns The DietTag domain model.
   */
  getDietTagBySlug(slug: string): ResultAsync<DietTag, DomainError>;
}

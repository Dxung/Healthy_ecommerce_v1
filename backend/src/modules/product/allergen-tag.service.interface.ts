import type { ResultAsync } from 'neverthrow';
import type { AllergenTag } from './models/allergen-tag.model';
import type { DomainError } from 'src/shared/types/domain-error.type';
import type { CreateAllergenTagArgumentDto } from './dto/allergen-tag/create-allergen-tag-argument.dto';
import type { UpdateAllergenTagArgumentDto } from './dto/allergen-tag/update-allergen-tag-argument.dto';

export interface IAllergenTagService {
  // ======================== ADMIN OPERATIONS ========================

  /**
   * Gets all allergen tags with optional filter.
   * @param activeOnly - If true, returns only active allergen tags.
   * @returns Array of AllergenTag domain models.
   */
  getAllAllergenTags(
    activeOnly?: boolean,
  ): ResultAsync<AllergenTag[], DomainError>;

  /**
   * Gets an allergen tag by its ID.
   * @param id - The allergen tag ID.
   * @returns The AllergenTag domain model.
   */
  getAllergenTagById(id: string): ResultAsync<AllergenTag, DomainError>;

  /**
   * Creates a new allergen tag.
   * @param dto - The create allergen tag DTO.
   * @returns The created AllergenTag domain model.
   */
  createAllergenTag(
    dto: CreateAllergenTagArgumentDto,
  ): ResultAsync<AllergenTag, DomainError>;

  /**
   * Updates an existing allergen tag.
   * @param id - The allergen tag ID.
   * @param dto - The update allergen tag DTO.
   * @returns The updated AllergenTag domain model.
   */
  updateAllergenTag(
    id: string,
    dto: UpdateAllergenTagArgumentDto,
  ): ResultAsync<AllergenTag, DomainError>;

  /**
   * Deletes an allergen tag.
   * @param id - The allergen tag ID.
   * @returns void on success.
   */
  deleteAllergenTag(id: string): ResultAsync<void, DomainError>;

  // ======================== PUBLIC OPERATIONS ========================

  /**
   * Gets an allergen tag by its slug.
   * @param slug - The allergen tag slug.
   * @returns The AllergenTag domain model.
   */
  getAllergenTagBySlug(slug: string): ResultAsync<AllergenTag, DomainError>;
}

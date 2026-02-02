import type { ResultAsync } from 'neverthrow';
import type { DomainError } from 'src/shared/types/domain-error.type';

export interface AllergenExclusionInfo {
  id: string;
  allergenTagId: string;
  allergenTagName: string;
  allergenTagSlug: string;
}

export interface IAllergenExclusionRepository {
  /**
   * Get user's allergen exclusions.
   */
  getByUserId(
    userId: string,
  ): ResultAsync<AllergenExclusionInfo[], DomainError>;

  /**
   * Set user's allergen exclusions (replaces all existing).
   */
  setExclusions(
    userId: string,
    allergenTagIds: string[],
  ): ResultAsync<void, DomainError>;

  /**
   * Add an allergen exclusion.
   */
  addExclusion(
    userId: string,
    allergenTagId: string,
  ): ResultAsync<void, DomainError>;

  /**
   * Remove an allergen exclusion.
   */
  removeExclusion(
    userId: string,
    allergenTagId: string,
  ): ResultAsync<void, DomainError>;
}

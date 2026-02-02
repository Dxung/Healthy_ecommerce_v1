import type { ResultAsync } from 'neverthrow';
import type { DomainError } from 'src/shared/types/domain-error.type';

export interface DietPreferenceInfo {
  id: string;
  dietTagId: string;
  dietTagName: string;
  dietTagSlug: string;
}

export interface IDietPreferenceRepository {
  /**
   * Get user's diet preferences.
   */
  getByUserId(userId: string): ResultAsync<DietPreferenceInfo[], DomainError>;

  /**
   * Set user's diet preferences (replaces all existing).
   */
  setPreferences(
    userId: string,
    dietTagIds: string[],
  ): ResultAsync<void, DomainError>;

  /**
   * Add a diet preference.
   */
  addPreference(
    userId: string,
    dietTagId: string,
  ): ResultAsync<void, DomainError>;

  /**
   * Remove a diet preference.
   */
  removePreference(
    userId: string,
    dietTagId: string,
  ): ResultAsync<void, DomainError>;
}

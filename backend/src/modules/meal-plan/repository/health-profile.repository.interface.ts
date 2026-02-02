import type { ResultAsync } from 'neverthrow';
import type { UserHealthProfile } from '../models/user-health-profile.model';
import type { DomainError } from 'src/shared/types/domain-error.type';

export interface IHealthProfileRepository {
  /**
   * Finds health profile by user ID.
   */
  findByUserId(
    userId: string,
  ): ResultAsync<UserHealthProfile | null, DomainError>;

  /**
   * Finds health profile by its ID.
   */
  findById(id: string): ResultAsync<UserHealthProfile | null, DomainError>;

  /**
   * Creates a health profile.
   */
  create(
    profile: UserHealthProfile,
  ): ResultAsync<UserHealthProfile, DomainError>;

  /**
   * Updates a health profile.
   */
  update(
    profile: UserHealthProfile,
  ): ResultAsync<UserHealthProfile, DomainError>;

  /**
   * Upserts (create or update) a health profile.
   */
  upsert(
    profile: UserHealthProfile,
  ): ResultAsync<UserHealthProfile, DomainError>;
}

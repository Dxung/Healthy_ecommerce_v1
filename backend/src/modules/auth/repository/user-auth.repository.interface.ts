import { ResultAsync } from 'neverthrow';
import { UserAuth } from '../models/user-auth.model';
import { DomainError } from 'src/shared/types/domain-error.type';

export interface IUserAuthRepository {
  /**
   * Creates a new authentication record for a user.
   * @param userAuth - The UserAuth domain model containing auth details.
   * @returns ResultAsync containing the created UserAuth on success or DomainError on failure.
   */
  createNewAuthForUser(userAuth: UserAuth): ResultAsync<UserAuth, DomainError>;

  /**
   * Gets the hashed password for a user with LOCAL provider.
   * @param userId - The ID of the user.
   * @returns ResultAsync containing the hashed password string if found, null if not found, or DomainError on failure.
   */
  getHashedPassword(userId: string): ResultAsync<string | null, DomainError>;

  /**
   * Changes the password for a user with LOCAL provider.
   * @param userId - The ID of the user.
   * @param newHashedPassword - The new hashed password.
   * @returns ResultAsync containing void on success or DomainError on failure.
   */
  changePassword(
    userId: string,
    newHashedPassword: string,
  ): ResultAsync<void, DomainError>;

  /**
   * Gets the password updated timestamp for a user with LOCAL provider.
   * @param userId - The ID of the user.
   * @returns ResultAsync containing the Date when password was last updated if found, null if not found, or DomainError on failure.
   */
  getPasswordUpdatedAt(userId: string): ResultAsync<Date | null, DomainError>;
}

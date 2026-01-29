import type { ResultAsync } from 'neverthrow';
import type { User } from '../models/user.model';
import type { DomainError } from 'src/shared/types/domain-error.type';
import type { UserStatus } from '../enums/user-status.enum';
import type {
  PaginatedResult,
  PaginationParams,
} from 'src/shared/types/pagination.type';

/**
 * Filter options for admin user listing
 */
export interface AdminUserFilter {
  search?: string; // Search by username, phone, email
  status?: UserStatus;
  fromDate?: Date;
  toDate?: Date;
}

export interface IUserCoreRepository {
  /**
   * Finds a user by their phone number.
   * @param phone - The user's phone number
   * @returns The User domain model or null if not found. In case of system error, returns appropriate UserErrorType.
   */
  findUserByPhone(phone: string): ResultAsync<User | null, DomainError>;

  /**
   * Checks if a username is available.
   * @param username - The username to check for availability.
   * @returns True if the username is available, false otherwise. In case of system error, returns appropriate UserErrorType.
   */
  isUsernameAvailable(username: string): ResultAsync<boolean, DomainError>;

  /**
   * creates a new user when using phone number registration
   * @param phoneNumber Phone number of the new user
   * @param username Username wanted for new user
   * @param password Password wanted for new user
   * @return ResultAsync that resolves to created User instance if success, otherwise return DomainError
   */
  createUserWithPhone(user: User): ResultAsync<User, DomainError>;

  /**
   * Finds a user by their username.
   * @param username - The username to search for.
   * @returns The User domain model or null if not found. In case of system error, returns appropriate DomainError.
   */
  findUserByUsername(username: string): ResultAsync<User | null, DomainError>;

  /**
   * Finds a user by their email address.
   * @param email - The email address to search for.
   * @returns The User domain model or null if not found. In case of system error, returns appropriate DomainError.
   */
  findUserByEmail(email: string): ResultAsync<User | null, DomainError>;

  /**
   * Finds a user by their ID.
   * @param userId - The user's ID.
   * @returns The User domain model or null if not found. In case of system error, returns appropriate DomainError.
   */
  findUserById(userId: string): ResultAsync<User | null, DomainError>;

  /**
   * Updates an existing user's information.
   * @param user - The User domain model with updated fields.
   * @returns ResultAsync that resolves to the updated User instance on success, or DomainError on failure.
   */
  updateUser(user: User): ResultAsync<User, DomainError>;

  // ==================== ADMIN METHODS ====================

  /**
   * Finds all users with pagination and filters (admin).
   * @param pagination - Pagination parameters.
   * @param filter - Optional filter criteria.
   * @returns Paginated list of User domain models.
   */
  findAllUsers(
    pagination: PaginationParams,
    filter?: AdminUserFilter,
  ): ResultAsync<PaginatedResult<User>, DomainError>;

  /**
   * Soft deletes a user by ID (admin).
   * Sets deletedAt and status to DELETED.
   * @param userId - The user ID to delete.
   * @returns void on success.
   */
  softDeleteUser(userId: string): ResultAsync<void, DomainError>;
}

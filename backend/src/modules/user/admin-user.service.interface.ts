import type { ResultAsync } from 'neverthrow';
import type { User } from './models/user.model';
import type { DomainError } from 'src/shared/types/domain-error.type';
import type { UserStatus } from './enums/user-status.enum';
import type {
  PaginatedResult,
  PaginationParams,
} from 'src/shared/types/pagination.type';
import type { AdminUserFilter } from './repository/user-core.repository.interface';

/**
 * Admin user info for list view
 */
export interface AdminUserInfo {
  id: string;
  username: string;
  fullName: string | null;
  email: string | null;
  phoneNumber: string | null;
  avatarUrl: string;
  status: UserStatus;
  createdAt: Date;
}

export interface IAdminUserService {
  /**
   * Gets all users with pagination and filters (admin).
   * @param pagination - Pagination parameters.
   * @param filter - Optional filter criteria (search, status, date range).
   * @returns Paginated list of AdminUserInfo.
   */
  getAllUsers(
    pagination: PaginationParams,
    filter?: AdminUserFilter,
  ): ResultAsync<PaginatedResult<AdminUserInfo>, DomainError>;

  /**
   * Gets a user by ID (admin).
   * @param userId - The user ID.
   * @returns User details or error if not found.
   */
  getUserById(userId: string): ResultAsync<User, DomainError>;

  /**
   * Suspends a user account (admin).
   * Sets status to SUSPENDED and removes all sessions.
   * @param userId - The user ID to suspend.
   * @param reason - The reason for suspension (stored for display to user).
   * @returns void on success.
   */
  suspendUser(userId: string, reason: string): ResultAsync<void, DomainError>;

  /**
   * Activates a suspended user account (admin).
   * Sets status back to ACTIVE.
   * @param userId - The user ID to activate.
   * @returns void on success.
   */
  activateUser(userId: string): ResultAsync<void, DomainError>;

  /**
   * Soft deletes a user account (admin).
   * Sets status to DELETED and deletedAt timestamp.
   * @param userId - The user ID to delete.
   * @returns void on success.
   */
  deleteUser(userId: string): ResultAsync<void, DomainError>;
}

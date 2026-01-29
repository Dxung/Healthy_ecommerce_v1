import type { ResultAsync } from 'neverthrow';
import type { DomainError } from 'src/shared/types/domain-error.type';

export interface IAuthorizationService {
  /**
   * Checks if user has ANY of the required permissions.
   * Uses caching for non-admin users (15 min TTL).
   *
   * @param userId - The user's ID
   * @param requiredPermissions - Array of permission strings (e.g., ["product:create", "product:update"])
   * @returns true if user has at least one of the required permissions, false otherwise
   */
  hasAnyPermission(
    userId: string,
    requiredPermissions: string[],
  ): ResultAsync<boolean, DomainError>;

  /**
   * Gets all permissions for a user.
   * Uses caching for non-admin users (15 min TTL).
   * Admin users always get fresh data from DB.
   *
   * @param userId - The user's ID
   * @returns Array of permission strings the user has
   */
  getUserPermissions(userId: string): ResultAsync<string[], DomainError>;

  /**
   * Gets all roles for a user.
   *
   * @param userId - The user's ID
   * @returns Array of role names the user has
   */
  getUserRoles(userId: string): ResultAsync<string[], DomainError>;

  /**
   * Invalidates the permission cache for a user.
   * Call this when user's roles or permissions change.
   *
   * @param userId - The user's ID
   * @returns ResultAsync<void, DomainError> - Never fails (cache errors are swallowed)
   */
  invalidateUserPermissionCache(userId: string): ResultAsync<void, DomainError>;

  /**
   * Assigns a role to a user.
   * Automatically invalidates the user's permission cache after assignment.
   *
   * @param userId - The user's ID
   * @param roleName - The role name to assign (e.g., "buyer", "shop")
   * @param assignedBy - The ID of the user who assigned this role (null for system assignment)
   * @param expireAt - Optional expiration date for the role assignment
   * @returns void on success, DomainError on failure
   *
   * Errors:
   * - ROLE_NOT_FOUND if the role name doesn't exist
   * - USER_ALREADY_HAS_ROLE if user already has this role
   */
  assignRoleToUser(
    userId: string,
    roleName: string,
    assignedBy: string | null,
    expireAt?: Date | null,
  ): ResultAsync<void, DomainError>;

  /**
   * Invalidates permission cache for all users with a specific role.
   * Useful after making direct SQL changes to role permissions.
   *
   * @param roleId - The role's UUID
   * @returns Number of users whose cache was invalidated
   */
  invalidateCacheForRole(roleId: string): ResultAsync<number, DomainError>;
}

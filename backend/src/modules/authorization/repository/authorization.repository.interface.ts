import type { ResultAsync } from 'neverthrow';
import type { DomainError } from 'src/shared/types/domain-error.type';

export interface IAuthorizationRepository {
  /**
   * Gets all permission strings for a user through their roles.
   * Format: "resource:action" (e.g., "product:create", "order:read")
   *
   * Query flow: user → users_have_roles → role → roles_have_permissions → permission
   *
   * Filters:
   * - Only active roles (role.isActive = true)
   * - Only non-expired role assignments (expireAt IS NULL OR expireAt > NOW())
   *
   * @param userId - The user's ID
   * @returns Array of permission strings like ["product:create", "product:update"]
   */
  getUserPermissions(userId: string): ResultAsync<string[], DomainError>;

  /**
   * Checks if user has any of the specified roles.
   * Used by service to determine if caching should be bypassed.
   *
   * @param userId - The user's ID
   * @param roleNames - Array of role names to check (e.g., ["admin", "super_admin"])
   * @returns true if user has any of the specified roles (active and non-expired)
   */
  hasAnyRole(
    userId: string,
    roleNames: string[],
  ): ResultAsync<boolean, DomainError>;

  /**
   * Gets all role names for a user.
   *
   * @param userId - The user's ID
   * @returns Array of role names like ["buyer", "admin"]
   */
  getUserRoles(userId: string): ResultAsync<string[], DomainError>;

  /**
   * Assigns a role to a user by creating a users_have_roles record.
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
}

import { ResultAsync } from 'neverthrow';
import { DomainError } from 'src/shared/types/domain-error.type';
import { Role } from '../models';

export interface IRoleRepository {
  /**
   * Find all roles
   */
  findAll(filter?: { isActive?: boolean }): ResultAsync<Role[], DomainError>;

  /**
   * Find role by ID
   */
  findById(id: string): ResultAsync<Role | null, DomainError>;

  /**
   * Find role by ID with its permissions loaded
   */
  findByIdWithPermissions(id: string): ResultAsync<Role | null, DomainError>;

  /**
   * Find role by name
   */
  findByName(roleName: string): ResultAsync<Role | null, DomainError>;

  /**
   * Create a new role
   */
  create(role: Role): ResultAsync<Role, DomainError>;

  /**
   * Update an existing role
   */
  update(role: Role): ResultAsync<Role, DomainError>;

  /**
   * Delete a role by ID
   */
  delete(id: string): ResultAsync<void, DomainError>;

  /**
   * Check if role has any users assigned
   */
  hasUsers(roleId: string): ResultAsync<boolean, DomainError>;

  /**
   * Check if role name already exists (excluding a specific role ID)
   */
  roleNameExists(
    roleName: string,
    excludeId?: string,
  ): ResultAsync<boolean, DomainError>;

  /**
   * Assign permissions to a role
   */
  assignPermissions(
    roleId: string,
    permissionIds: string[],
    grantedBy: string,
    note?: string,
  ): ResultAsync<void, DomainError>;

  /**
   * Remove a permission from a role
   */
  removePermission(
    roleId: string,
    permissionId: string,
  ): ResultAsync<void, DomainError>;

  /**
   * Get all permission IDs assigned to a role
   */
  getPermissionIds(roleId: string): ResultAsync<string[], DomainError>;

  /**
   * Get all user IDs that have a specific role
   */
  getUserIdsWithRole(roleId: string): ResultAsync<string[], DomainError>;

  /**
   * Get all roles assigned to a user with assignment details
   */
  getUserRolesWithDetails(userId: string): ResultAsync<
    Array<{
      role: Role;
      assignedAt: Date;
      expireAt: Date | null;
      assignedBy: string | null;
    }>,
    DomainError
  >;

  /**
   * Assign a role to a user
   */
  assignRoleToUser(
    userId: string,
    roleId: string,
    assignedBy: string,
    expireAt?: Date,
  ): ResultAsync<void, DomainError>;

  /**
   * Remove a role from a user
   */
  removeRoleFromUser(
    userId: string,
    roleId: string,
  ): ResultAsync<void, DomainError>;

  /**
   * Check if user has a specific role
   */
  userHasRole(
    userId: string,
    roleId: string,
  ): ResultAsync<boolean, DomainError>;
}

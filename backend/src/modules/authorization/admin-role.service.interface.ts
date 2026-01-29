import { ResultAsync } from 'neverthrow';
import { DomainError } from 'src/shared/types/domain-error.type';
import { Role } from './models';
import {
  CreateRoleArgumentDto,
  UpdateRoleArgumentDto,
  AssignPermissionsArgumentDto,
} from './dto';

export interface IAdminRoleService {
  /**
   * Get all roles
   */
  getAllRoles(activeOnly?: boolean): ResultAsync<Role[], DomainError>;

  /**
   * Get a role by ID
   */
  getRoleById(id: string): ResultAsync<Role, DomainError>;

  /**
   * Get a role by ID with its permissions loaded
   */
  getRoleWithPermissions(id: string): ResultAsync<Role, DomainError>;

  /**
   * Create a new role
   */
  createRole(dto: CreateRoleArgumentDto): ResultAsync<Role, DomainError>;

  /**
   * Update an existing role
   */
  updateRole(
    id: string,
    dto: UpdateRoleArgumentDto,
  ): ResultAsync<Role, DomainError>;

  /**
   * Delete a role
   */
  deleteRole(id: string): ResultAsync<void, DomainError>;

  /**
   * Assign permissions to a role
   * Note: The grantedBy user ID is obtained from ALS (set by AuthGuard)
   */
  assignPermissionsToRole(
    roleId: string,
    dto: AssignPermissionsArgumentDto,
  ): ResultAsync<Role, DomainError>;

  /**
   * Remove a permission from a role
   */
  removePermissionFromRole(
    roleId: string,
    permissionId: string,
  ): ResultAsync<void, DomainError>;

  /**
   * Invalidate permission cache for all users with a specific role.
   * Useful after making direct SQL changes to role permissions.
   *
   * @param roleId - The role's UUID
   * @returns Number of users whose cache was invalidated
   */
  invalidateRoleCache(roleId: string): ResultAsync<number, DomainError>;
}

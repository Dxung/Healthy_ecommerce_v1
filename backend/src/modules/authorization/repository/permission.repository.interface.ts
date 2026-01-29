import { ResultAsync } from 'neverthrow';
import { DomainError } from 'src/shared/types/domain-error.type';
import { Permission } from '../models';

export interface IPermissionRepository {
  /**
   * Find all permissions
   */
  findAll(): ResultAsync<Permission[], DomainError>;

  /**
   * Find permission by ID
   */
  findById(id: string): ResultAsync<Permission | null, DomainError>;

  /**
   * Find permissions by IDs
   */
  findByIds(ids: string[]): ResultAsync<Permission[], DomainError>;

  /**
   * Find permission by name (resource:action format)
   */
  findByName(
    permissionName: string,
  ): ResultAsync<Permission | null, DomainError>;

  /**
   * Create a new permission
   */
  create(permission: Permission): ResultAsync<Permission, DomainError>;

  /**
   * Update an existing permission
   */
  update(permission: Permission): ResultAsync<Permission, DomainError>;

  /**
   * Delete a permission by ID
   */
  delete(id: string): ResultAsync<void, DomainError>;

  /**
   * Check if permission has any roles assigned
   */
  hasRoles(permissionId: string): ResultAsync<boolean, DomainError>;

  /**
   * Check if permission name already exists (excluding a specific permission ID)
   */
  permissionNameExists(
    permissionName: string,
    excludeId?: string,
  ): ResultAsync<boolean, DomainError>;

  /**
   * Check if resource:action combination already exists (excluding a specific permission ID)
   */
  resourceActionExists(
    resource: string,
    action: string,
    excludeId?: string,
  ): ResultAsync<boolean, DomainError>;
}

import { ResultAsync } from 'neverthrow';
import { DomainError } from 'src/shared/types/domain-error.type';
import { Permission } from './models';
import {
  CreatePermissionArgumentDto,
  UpdatePermissionArgumentDto,
} from './dto';

export interface IAdminPermissionService {
  /**
   * Get all permissions
   */
  getAllPermissions(): ResultAsync<Permission[], DomainError>;

  /**
   * Get all permissions grouped by resource
   */
  getPermissionsGroupedByResource(): ResultAsync<
    Map<string, Permission[]>,
    DomainError
  >;

  /**
   * Get a permission by ID
   */
  getPermissionById(id: string): ResultAsync<Permission, DomainError>;

  /**
   * Create a new permission
   */
  createPermission(
    dto: CreatePermissionArgumentDto,
  ): ResultAsync<Permission, DomainError>;

  /**
   * Update an existing permission
   */
  updatePermission(
    id: string,
    dto: UpdatePermissionArgumentDto,
  ): ResultAsync<Permission, DomainError>;

  /**
   * Delete a permission
   */
  deletePermission(id: string): ResultAsync<void, DomainError>;
}

import { Inject, Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { ResultAsync, errAsync, okAsync } from 'neverthrow';
import { IAdminRoleService } from './admin-role.service.interface';
import { IRoleRepository } from './repository/role.repository.interface';
import { IPermissionRepository } from './repository/permission.repository.interface';
import { IAuthorizationService } from './authorization.service.interface';
import { Role } from './models';
import {
  CreateRoleArgumentDto,
  UpdateRoleArgumentDto,
  AssignPermissionsArgumentDto,
} from './dto';
import {
  ROLE_REPOSITORY,
  PERMISSION_REPOSITORY,
} from 'src/database/typeorm/tokens/database.token';
import { AUTHORIZATION_SERVICE } from './tokens/authorization.token';
import {
  createDomainError,
  DomainError,
} from 'src/shared/types/domain-error.type';
import { AUTHORIZATION_ERRORS } from './errors/authorization.errors';
import { SHARED_ERRORS } from 'src/shared/errors/shared.errors';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import { ITypeORMAlsStore } from 'src/shared/als/interfaces/als-store.interface';

const SYSTEM_ROLES = ['super_admin', 'admin', 'buyer', 'shop'];

@Injectable()
export class AdminRoleService implements IAdminRoleService {
  constructor(
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
    @Inject(PERMISSION_REPOSITORY)
    private readonly permissionRepository: IPermissionRepository,
    @Inject(AUTHORIZATION_SERVICE)
    private readonly authorizationService: IAuthorizationService,
  ) {}

  @WithPosition()
  getAllRoles(activeOnly?: boolean): ResultAsync<Role[], DomainError> {
    const filter =
      activeOnly !== undefined ? { isActive: activeOnly } : undefined;
    return this.roleRepository.findAll(filter);
  }

  @WithPosition()
  getRoleById(id: string): ResultAsync<Role, DomainError> {
    return this.roleRepository.findById(id).andThen((role) => {
      if (!role) {
        return errAsync(createDomainError(AUTHORIZATION_ERRORS.ROLE_NOT_FOUND));
      }
      return okAsync(role);
    });
  }

  @WithPosition()
  getRoleWithPermissions(id: string): ResultAsync<Role, DomainError> {
    return this.roleRepository.findByIdWithPermissions(id).andThen((role) => {
      if (!role) {
        return errAsync(createDomainError(AUTHORIZATION_ERRORS.ROLE_NOT_FOUND));
      }
      return okAsync(role);
    });
  }

  @WithPosition()
  createRole(dto: CreateRoleArgumentDto): ResultAsync<Role, DomainError> {
    // Check if role name already exists
    return this.roleRepository
      .roleNameExists(dto.roleName)
      .andThen((exists) => {
        if (exists) {
          return errAsync(
            createDomainError(AUTHORIZATION_ERRORS.ROLE_NAME_EXISTS),
          );
        }

        const role = Role.create({
          roleName: dto.roleName,
          description: dto.description,
        });

        return this.roleRepository.create(role);
      });
  }

  @WithPosition()
  updateRole(
    id: string,
    dto: UpdateRoleArgumentDto,
  ): ResultAsync<Role, DomainError> {
    return this.roleRepository
      .findById(id)
      .andThen((role) => {
        if (!role) {
          return errAsync(
            createDomainError(AUTHORIZATION_ERRORS.ROLE_NOT_FOUND),
          );
        }

        // Check if trying to modify system role
        if (SYSTEM_ROLES.includes(role.roleName)) {
          return errAsync(
            createDomainError(AUTHORIZATION_ERRORS.ROLE_IS_SYSTEM),
          );
        }

        // Check if new role name conflicts with existing role
        if (dto.roleName && dto.roleName !== role.roleName) {
          return this.roleRepository
            .roleNameExists(dto.roleName, id)
            .andThen((exists) => {
              if (exists) {
                return errAsync(
                  createDomainError(AUTHORIZATION_ERRORS.ROLE_NAME_EXISTS),
                );
              }
              return okAsync(role);
            });
        }

        return okAsync(role);
      })
      .andThen((role) => {
        // Apply updates
        if (dto.roleName !== undefined || dto.description !== undefined) {
          role.updateInfo(
            dto.roleName ?? role.roleName,
            dto.description !== undefined
              ? (dto.description ?? null)
              : role.description,
          );
        }

        if (dto.isActive !== undefined) {
          if (dto.isActive) {
            role.activate();
          } else {
            role.deactivate();
          }
        }

        return this.roleRepository.update(role).andThen((updatedRole) => {
          // Invalidate cache for all users with this role
          return this.invalidateCacheForRole(id).map(() => updatedRole);
        });
      });
  }

  @WithPosition()
  deleteRole(id: string): ResultAsync<void, DomainError> {
    return this.roleRepository.findById(id).andThen((role) => {
      if (!role) {
        return errAsync(createDomainError(AUTHORIZATION_ERRORS.ROLE_NOT_FOUND));
      }

      // Check if trying to delete system role
      if (SYSTEM_ROLES.includes(role.roleName)) {
        return errAsync(createDomainError(AUTHORIZATION_ERRORS.ROLE_IS_SYSTEM));
      }

      // Check if role has users assigned
      return this.roleRepository.hasUsers(id).andThen((hasUsers) => {
        if (hasUsers) {
          return errAsync(
            createDomainError(AUTHORIZATION_ERRORS.ROLE_HAS_USERS),
          );
        }

        return this.roleRepository.delete(id);
      });
    });
  }

  @WithPosition()
  assignPermissionsToRole(
    roleId: string,
    dto: AssignPermissionsArgumentDto,
  ): ResultAsync<Role, DomainError> {
    // Get current admin user ID from ALS (set by AuthGuard)
    const store = this.als.getStore();
    const grantedBy = store?.userId;

    // If no userId in ALS, return error (shouldn't happen if AuthGuard is used)
    if (!grantedBy) {
      return errAsync(
        createDomainError(SHARED_ERRORS.SYSTEM_ERROR, {
          cause: SHARED_ERRORS.SYSTEM_ERROR.message,
        }),
      );
    }

    // Verify role exists
    return this.roleRepository.findById(roleId).andThen((role) => {
      if (!role) {
        return errAsync(createDomainError(AUTHORIZATION_ERRORS.ROLE_NOT_FOUND));
      }

      // Verify all permissions exist
      return this.permissionRepository
        .findByIds(dto.permissionIds)
        .andThen((permissions) => {
          if (permissions.length !== dto.permissionIds.length) {
            return errAsync(
              createDomainError(AUTHORIZATION_ERRORS.PERMISSION_NOT_FOUND),
            );
          }

          // Assign permissions
          return this.roleRepository
            .assignPermissions(roleId, dto.permissionIds, grantedBy, dto.note)
            .andThen(() => this.invalidateCacheForRole(roleId))
            .andThen(() => this.getRoleWithPermissions(roleId));
        });
    });
  }

  @WithPosition()
  removePermissionFromRole(
    roleId: string,
    permissionId: string,
  ): ResultAsync<void, DomainError> {
    // Verify role exists
    return this.roleRepository.findById(roleId).andThen((role) => {
      if (!role) {
        return errAsync(createDomainError(AUTHORIZATION_ERRORS.ROLE_NOT_FOUND));
      }

      // Check if role has this permission
      return this.roleRepository
        .getPermissionIds(roleId)
        .andThen((permissionIds) => {
          if (!permissionIds.includes(permissionId)) {
            return errAsync(
              createDomainError(
                AUTHORIZATION_ERRORS.ROLE_DOES_NOT_HAVE_PERMISSION,
              ),
            );
          }

          return this.roleRepository
            .removePermission(roleId, permissionId)
            .andThen(() => this.invalidateCacheForRole(roleId));
        });
    });
  }

  /**
   * Invalidate permission cache for all users with a specific role.
   * This is a public method that can be called via admin API after SQL changes.
   */
  @WithPosition()
  invalidateRoleCache(roleId: string): ResultAsync<number, DomainError> {
    return this.roleRepository.findById(roleId).andThen((role) => {
      if (!role) {
        return errAsync(createDomainError(AUTHORIZATION_ERRORS.ROLE_NOT_FOUND));
      }

      return this.authorizationService.invalidateCacheForRole(roleId);
    });
  }

  /**
   * Invalidate permission cache for all users with a specific role (internal use)
   */
  private invalidateCacheForRole(
    roleId: string,
  ): ResultAsync<void, DomainError> {
    return this.authorizationService
      .invalidateCacheForRole(roleId)
      .map(() => undefined);
  }
}

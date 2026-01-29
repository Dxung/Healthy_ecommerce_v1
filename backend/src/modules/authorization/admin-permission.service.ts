import { Inject, Injectable } from '@nestjs/common';
import { ResultAsync, errAsync, okAsync } from 'neverthrow';
import { IAdminPermissionService } from './admin-permission.service.interface';
import { IPermissionRepository } from './repository/permission.repository.interface';
import { Permission } from './models';
import {
  CreatePermissionArgumentDto,
  UpdatePermissionArgumentDto,
} from './dto';
import { PERMISSION_REPOSITORY } from 'src/database/typeorm/tokens/database.token';
import {
  createDomainError,
  DomainError,
} from 'src/shared/types/domain-error.type';
import { AUTHORIZATION_ERRORS } from './errors/authorization.errors';
import { WithPosition } from 'src/common/decorators/with-position.decorator';

@Injectable()
export class AdminPermissionService implements IAdminPermissionService {
  constructor(
    @Inject(PERMISSION_REPOSITORY)
    private readonly permissionRepository: IPermissionRepository,
  ) {}

  @WithPosition()
  getAllPermissions(): ResultAsync<Permission[], DomainError> {
    return this.permissionRepository.findAll();
  }

  @WithPosition()
  getPermissionsGroupedByResource(): ResultAsync<
    Map<string, Permission[]>,
    DomainError
  > {
    return this.permissionRepository.findAll().map((permissions) => {
      const grouped = new Map<string, Permission[]>();

      for (const permission of permissions) {
        const existing = grouped.get(permission.resource) ?? [];
        existing.push(permission);
        grouped.set(permission.resource, existing);
      }

      return grouped;
    });
  }

  @WithPosition()
  getPermissionById(id: string): ResultAsync<Permission, DomainError> {
    return this.permissionRepository.findById(id).andThen((permission) => {
      if (!permission) {
        return errAsync(
          createDomainError(AUTHORIZATION_ERRORS.PERMISSION_NOT_FOUND),
        );
      }
      return okAsync(permission);
    });
  }

  @WithPosition()
  createPermission(
    dto: CreatePermissionArgumentDto,
  ): ResultAsync<Permission, DomainError> {
    // Check if resource:action combination already exists
    return this.permissionRepository
      .resourceActionExists(dto.resource, dto.action)
      .andThen((exists) => {
        if (exists) {
          return errAsync(
            createDomainError(AUTHORIZATION_ERRORS.PERMISSION_NAME_EXISTS),
          );
        }

        const permission = Permission.create({
          resource: dto.resource,
          action: dto.action,
          description: dto.description,
        });

        return this.permissionRepository.create(permission);
      });
  }

  @WithPosition()
  updatePermission(
    id: string,
    dto: UpdatePermissionArgumentDto,
  ): ResultAsync<Permission, DomainError> {
    return this.permissionRepository.findById(id).andThen((permission) => {
      if (!permission) {
        return errAsync(
          createDomainError(AUTHORIZATION_ERRORS.PERMISSION_NOT_FOUND),
        );
      }

      // Only description can be updated (resource and action are immutable)
      if (dto.description !== undefined) {
        permission.updateDescription(dto.description ?? null);
      }

      return this.permissionRepository.update(permission);
    });
  }

  @WithPosition()
  deletePermission(id: string): ResultAsync<void, DomainError> {
    return this.permissionRepository.findById(id).andThen((permission) => {
      if (!permission) {
        return errAsync(
          createDomainError(AUTHORIZATION_ERRORS.PERMISSION_NOT_FOUND),
        );
      }

      // Check if permission is assigned to any roles
      return this.permissionRepository.hasRoles(id).andThen((hasRoles) => {
        if (hasRoles) {
          return errAsync(
            createDomainError(AUTHORIZATION_ERRORS.PERMISSION_HAS_ROLES),
          );
        }

        return this.permissionRepository.delete(id);
      });
    });
  }
}

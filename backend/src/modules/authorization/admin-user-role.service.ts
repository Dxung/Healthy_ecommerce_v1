import { Inject, Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { ResultAsync, errAsync } from 'neverthrow';
import { IAdminUserRoleService } from './admin-user-role.service.interface';
import { IRoleRepository } from './repository/role.repository.interface';
import { IUserCoreRepository } from '../user/repository/user-core.repository.interface';
import { IAuthorizationService } from './authorization.service.interface';
import { AssignRoleArgumentDto, UserRoleAssignmentDto } from './dto';
import {
  ROLE_REPOSITORY,
  USER_CORE_REPOSITORY,
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

@Injectable()
export class AdminUserRoleService implements IAdminUserRoleService {
  constructor(
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
    @Inject(USER_CORE_REPOSITORY)
    private readonly userRepository: IUserCoreRepository,
    @Inject(AUTHORIZATION_SERVICE)
    private readonly authorizationService: IAuthorizationService,
  ) {}

  @WithPosition()
  getUserRoles(
    userId: string,
  ): ResultAsync<UserRoleAssignmentDto[], DomainError> {
    // First verify user exists
    return this.userRepository.findUserById(userId).andThen((user) => {
      if (!user) {
        return errAsync(createDomainError(AUTHORIZATION_ERRORS.USER_NOT_FOUND));
      }

      return this.roleRepository
        .getUserRolesWithDetails(userId)
        .map((rolesWithDetails) =>
          rolesWithDetails.map((item) => ({
            roleId: item.role.id,
            roleName: item.role.roleName,
            description: item.role.description,
            assignedAt: item.assignedAt,
            expireAt: item.expireAt,
            assignedBy: item.assignedBy,
          })),
        );
    });
  }

  @WithPosition()
  assignRoleToUser(
    userId: string,
    dto: AssignRoleArgumentDto,
  ): ResultAsync<void, DomainError> {
    // Get current admin user ID from ALS (set by AuthGuard)
    const store = this.als.getStore();
    const assignedBy = store?.userId;

    // If no userId in ALS, return error (shouldn't happen if AuthGuard is used)
    if (!assignedBy) {
      return errAsync(
        createDomainError(SHARED_ERRORS.SYSTEM_ERROR, {
          cause: SHARED_ERRORS.SYSTEM_ERROR.message,
        }),
      );
    }

    // Verify user exists
    return this.userRepository.findUserById(userId).andThen((user) => {
      if (!user) {
        return errAsync(createDomainError(AUTHORIZATION_ERRORS.USER_NOT_FOUND));
      }

      // Find role by name
      return this.roleRepository.findByName(dto.roleName).andThen((role) => {
        if (!role) {
          return errAsync(
            createDomainError(AUTHORIZATION_ERRORS.ROLE_NOT_FOUND),
          );
        }

        // Check if role is active
        if (!role.isActive) {
          return errAsync(
            createDomainError(AUTHORIZATION_ERRORS.ROLE_NOT_FOUND),
          );
        }

        // Parse expireAt if provided
        const expireAt = dto.expireAt ? new Date(dto.expireAt) : undefined;

        // Assign role to user
        return this.roleRepository
          .assignRoleToUser(userId, role.id, assignedBy, expireAt)
          .andThen(() =>
            this.authorizationService.invalidateUserPermissionCache(userId),
          );
      });
    });
  }

  @WithPosition()
  removeRoleFromUser(
    userId: string,
    roleId: string,
  ): ResultAsync<void, DomainError> {
    // Verify user exists
    return this.userRepository.findUserById(userId).andThen((user) => {
      if (!user) {
        return errAsync(createDomainError(AUTHORIZATION_ERRORS.USER_NOT_FOUND));
      }

      // Verify role exists
      return this.roleRepository.findById(roleId).andThen((role) => {
        if (!role) {
          return errAsync(
            createDomainError(AUTHORIZATION_ERRORS.ROLE_NOT_FOUND),
          );
        }

        // Check if user has this role
        return this.roleRepository
          .userHasRole(userId, roleId)
          .andThen((hasRole) => {
            if (!hasRole) {
              return errAsync(
                createDomainError(AUTHORIZATION_ERRORS.USER_DOES_NOT_HAVE_ROLE),
              );
            }

            // Remove role from user
            return this.roleRepository
              .removeRoleFromUser(userId, roleId)
              .andThen(() =>
                this.authorizationService.invalidateUserPermissionCache(userId),
              );
          });
      });
    });
  }
}

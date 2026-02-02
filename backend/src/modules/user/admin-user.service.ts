import { Inject, Injectable } from '@nestjs/common';
import { ResultAsync, errAsync, okAsync } from 'neverthrow';
import { AsyncLocalStorage } from 'async_hooks';
import {
  IAdminUserService,
  AdminUserInfo,
} from './admin-user.service.interface';
import { User } from './models/user.model';
import { UserStatus } from './enums/user-status.enum';
import type { IUserCoreRepository } from './repository/user-core.repository.interface';
import type { AdminUserFilter } from './repository/user-core.repository.interface';
import type { ISessionService } from '../session/session.service.interface';
import type { IAuthorizationService } from '../authorization/authorization.service.interface';
import { USER_CORE_REPOSITORY } from 'src/database/typeorm/tokens/database.token';
import { SESSION_SERVICE } from '../session/tokens/session.token';
import { AUTHORIZATION_SERVICE } from '../authorization/tokens/authorization.token';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { USER_ERRORS } from './errors/user.errors';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import type { ITypeORMAlsStore } from 'src/shared/als/interfaces/als-store.interface';
import type {
  PaginatedResult,
  PaginationParams,
} from 'src/shared/types/pagination.type';
import { CUSTOM_LOG } from 'src/shared/custom-loggers/tokens/custom-logger.token';
import type { ICustomLoggerService } from 'src/shared/custom-loggers/interfaces/custom-logger.service.interface';

const SUPER_ADMIN_ROLE = 'super_admin';

@Injectable()
export class AdminUserService implements IAdminUserService {
  constructor(
    @Inject(USER_CORE_REPOSITORY)
    private readonly userCoreRepository: IUserCoreRepository,
    @Inject(SESSION_SERVICE)
    private readonly sessionService: ISessionService,
    @Inject(AUTHORIZATION_SERVICE)
    private readonly authorizationService: IAuthorizationService,
    @Inject(CUSTOM_LOG)
    private readonly logger: ICustomLoggerService,
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
  ) {}

  /**
   * Checks if the target user has super_admin role.
   * Super admins cannot be modified by other admins.
   */
  private checkSuperAdminProtection(
    userId: string,
  ): ResultAsync<void, DomainError> {
    return this.authorizationService.getUserRoles(userId).andThen((roles) => {
      if (roles.includes(SUPER_ADMIN_ROLE)) {
        return errAsync(
          createDomainError(USER_ERRORS.CANNOT_MODIFY_SUPER_ADMIN, {
            cause: null,
          }),
        );
      }
      return okAsync(undefined);
    });
  }

  /**
   * Gets all users with pagination and filters (admin).
   */
  @WithPosition()
  getAllUsers(
    pagination: PaginationParams,
    filter?: AdminUserFilter,
  ): ResultAsync<PaginatedResult<AdminUserInfo>, DomainError> {
    return this.userCoreRepository
      .findAllUsers(pagination, filter)
      .map((paginatedResult) => ({
        ...paginatedResult,
        items: paginatedResult.items.map((user) => this.toAdminUserInfo(user)),
      }));
  }

  /**
   * Gets a user by ID (admin).
   */
  @WithPosition()
  getUserById(userId: string): ResultAsync<User, DomainError> {
    return this.userCoreRepository.findUserById(userId).andThen((user) => {
      if (!user) {
        return errAsync(
          createDomainError(USER_ERRORS.USER_NOT_FOUND, { cause: null }),
        );
      }
      return okAsync(user);
    });
  }

  /**
   * Suspends a user account (admin).
   * Sets status to SUSPENDED and removes all sessions.
   */
  @WithPosition()
  suspendUser(userId: string, reason: string): ResultAsync<void, DomainError> {
    // Get current admin user ID from ALS
    const store = this.als.getStore();
    const adminUserId = store?.userId;

    // Prevent admin from suspending themselves
    if (adminUserId === userId) {
      return errAsync(
        createDomainError(USER_ERRORS.CANNOT_MODIFY_OWN_ACCOUNT, {
          cause: null,
        }),
      );
    }

    // Check if target user is super_admin (protected)
    return this.checkSuperAdminProtection(userId).andThen(() =>
      this.userCoreRepository.findUserById(userId).andThen((user) => {
        if (!user) {
          return errAsync(
            createDomainError(USER_ERRORS.USER_NOT_FOUND, { cause: null }),
          );
        }

        // Check if already suspended
        if (user.status === UserStatus.SUSPENDED) {
          return errAsync(
            createDomainError(USER_ERRORS.USER_ALREADY_SUSPENDED, {
              cause: null,
            }),
          );
        }

        // Update user status to SUSPENDED
        user.changeStatus(UserStatus.SUSPENDED);

        // Save user and delete all sessions
        return this.userCoreRepository
          .updateUser(user)
          .andThen(() => this.sessionService.deleteAllUserSessions(userId))
          .map((deletedCount) => {
            this.logger.log(
              `User ${userId} suspended by admin. Reason: ${reason}. ${deletedCount} sessions removed.`,
              'AdminUserService',
            );
            return undefined;
          });
      }),
    );
  }

  /**
   * Activates a suspended user account (admin).
   */
  @WithPosition()
  activateUser(userId: string): ResultAsync<void, DomainError> {
    // Get current admin user ID from ALS
    const store = this.als.getStore();
    const adminUserId = store?.userId;

    // Prevent admin from activating themselves
    if (adminUserId === userId) {
      return errAsync(
        createDomainError(USER_ERRORS.CANNOT_MODIFY_OWN_ACCOUNT, {
          cause: null,
        }),
      );
    }

    // Check if target user is super_admin (protected)
    return this.checkSuperAdminProtection(userId).andThen(() =>
      this.userCoreRepository.findUserById(userId).andThen((user) => {
        if (!user) {
          return errAsync(
            createDomainError(USER_ERRORS.USER_NOT_FOUND, { cause: null }),
          );
        }

        // Check if already active
        if (user.status === UserStatus.ACTIVE) {
          return errAsync(
            createDomainError(USER_ERRORS.USER_ALREADY_ACTIVE, { cause: null }),
          );
        }

        // Update user status to ACTIVE
        user.changeStatus(UserStatus.ACTIVE);

        return this.userCoreRepository.updateUser(user).map(() => {
          this.logger.log(
            `User ${userId} activated by admin.`,
            'AdminUserService',
          );
          return undefined;
        });
      }),
    );
  }

  /**
   * Soft deletes a user account (admin).
   */
  @WithPosition()
  deleteUser(userId: string): ResultAsync<void, DomainError> {
    // Get current admin user ID from ALS
    const store = this.als.getStore();
    const adminUserId = store?.userId;

    // Prevent admin from deleting themselves
    if (adminUserId === userId) {
      return errAsync(
        createDomainError(USER_ERRORS.CANNOT_MODIFY_OWN_ACCOUNT, {
          cause: null,
        }),
      );
    }

    // Check if target user is super_admin (protected)
    return this.checkSuperAdminProtection(userId).andThen(() =>
      // Delete all sessions first, then soft delete user
      this.sessionService
        .deleteAllUserSessions(userId)
        .andThen(() => this.userCoreRepository.softDeleteUser(userId))
        .map(() => {
          this.logger.log(
            `User ${userId} deleted by admin.`,
            'AdminUserService',
          );
          return undefined;
        }),
    );
  }

  /**
   * Converts User domain model to AdminUserInfo DTO.
   */
  private toAdminUserInfo(user: User): AdminUserInfo {
    return {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      avatarUrl: user.avatarUrl,
      status: user.status,
      createdAt: user.createdAt,
    };
  }
}

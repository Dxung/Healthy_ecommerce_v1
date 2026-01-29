import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ResultAsync, okAsync } from 'neverthrow';
import { IAuthorizationService } from './authorization.service.interface';
import { IAuthorizationRepository } from './repository/authorization.repository.interface';
import { IRoleRepository } from './repository/role.repository.interface';
import {
  AUTHORIZATION_REPOSITORY,
  ROLE_REPOSITORY,
} from 'src/database/typeorm/tokens/database.token';
import {
  NO_CACHE_ROLES,
  PERMISSIONS_CACHE_PREFIX,
  PERMISSIONS_CACHE_TTL_MS,
  SUPER_ADMIN_ROLE,
} from './constants/authorization.constants';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import { CUSTOM_LOG } from 'src/shared/custom-loggers/tokens/custom-logger.token';
import { ICustomLoggerService } from 'src/shared/custom-loggers/interfaces/custom-logger.service.interface';
import type { DomainError } from 'src/shared/types/domain-error.type';

@Injectable()
export class AuthorizationService implements IAuthorizationService {
  constructor(
    @Inject(AUTHORIZATION_REPOSITORY)
    private readonly authorizationRepository: IAuthorizationRepository,
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    @Inject(CUSTOM_LOG)
    private readonly logger: ICustomLoggerService,
  ) {}

  //Step 1: Check if user is super_admin (bypass all checks)
  //Step 2: Get all the permissions of the user (getUserPermissions)
  //Step 3: Change the found permissions into a Set for faster lookup
  //Step 4: Check if the found permissions has any of the required permissions
  @WithPosition()
  hasAnyPermission(
    userId: string,
    requiredPermissions: string[],
  ): ResultAsync<boolean, DomainError> {
    // Step 1: Check super_admin bypass (hardcoded)
    return this.authorizationRepository
      .hasAnyRole(userId, [SUPER_ADMIN_ROLE])
      .andThen((isSuperAdmin) => {
        if (isSuperAdmin) {
          return okAsync(true); // Bypass all permission checks
        }

        // Step 2-4: Normal permission check
        return this.getUserPermissions(userId).map((userPermissions) => {
          const permissionSet = new Set(userPermissions);
          return requiredPermissions.some((required) =>
            permissionSet.has(required),
          );
        });
      });
  }

  //Step 1: Check if the user has any admin-like role that shouldnt use cache
  //Step 2: If admin, get fresh permissions from DB (getUserPermissions)
  //Step 3: If not admin, try get permissions from cache (getPermissionsWithCache)
  @WithPosition()
  getUserPermissions(userId: string): ResultAsync<string[], DomainError> {
    // Check if user has admin-like role (bypass cache)
    return this.authorizationRepository
      .hasAnyRole(userId, [...NO_CACHE_ROLES])
      .andThen((isAdmin) => {
        if (isAdmin) {
          // Admin users: always query fresh from DB
          return this.authorizationRepository.getUserPermissions(userId);
        }

        // Non-admin users: use cache
        return this.getPermissionsWithCache(userId);
      });
  }

  invalidateUserPermissionCache(userId: string): ResultAsync<void, never> {
    const cacheKey = this.buildCacheKey(userId);

    return ResultAsync.fromPromise(this.cacheManager.del(cacheKey), (error) => {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `Cache invalidation failed for user ${userId}: ${errorMsg}`,
        'AuthorizationService',
      );
    })
      .orElse(() => okAsync(undefined))
      .map(() => undefined);
  }

  //Step 1: Create the cache key through buildCacheKey
  //Step 2: Try to get permissions from cache
  //Step 3: If cache hit, return cached permissions; if miss, fetch from DB and cache
  private getPermissionsWithCache(
    userId: string,
  ): ResultAsync<string[], DomainError> {
    const cacheKey = this.buildCacheKey(userId);

    return ResultAsync.fromSafePromise(
      this.cacheManager.get<string[]>(cacheKey),
    ).andThen((cached) =>
      cached
        ? okAsync(cached)
        : this.fetchAndCachePermissions(userId, cacheKey),
    );
  }

  private fetchAndCachePermissions(
    userId: string,
    cacheKey: string,
  ): ResultAsync<string[], DomainError> {
    return this.authorizationRepository
      .getUserPermissions(userId)
      .map((permissions) => {
        // Fire and forget: cache the result, log warning if fails
        this.cacheManager
          .set(cacheKey, permissions, PERMISSIONS_CACHE_TTL_MS)
          .catch((error) => {
            const errorMsg =
              error instanceof Error ? error.message : String(error);
            this.logger.warn(
              `Cache set failed for user ${userId}: ${errorMsg}`,
              'AuthorizationService',
            );
          });
        return permissions;
      });
  }

  private buildCacheKey(userId: string): string {
    return `${PERMISSIONS_CACHE_PREFIX}:${userId}`;
  }

  @WithPosition()
  getUserRoles(userId: string): ResultAsync<string[], DomainError> {
    return this.authorizationRepository.getUserRoles(userId);
  }

  @WithPosition()
  assignRoleToUser(
    userId: string,
    roleName: string,
    assignedBy: string | null,
    expireAt?: Date | null,
  ): ResultAsync<void, DomainError> {
    return this.authorizationRepository
      .assignRoleToUser(userId, roleName, assignedBy, expireAt)
      .andThen(() => {
        // Invalidate cache after role assignment
        return this.invalidateUserPermissionCache(userId);
      });
  }

  @WithPosition()
  invalidateCacheForRole(roleId: string): ResultAsync<number, DomainError> {
    return this.roleRepository.getUserIdsWithRole(roleId).andThen((userIds) => {
      if (userIds.length === 0) {
        return okAsync(0);
      }

      const invalidations = userIds.map((userId) =>
        this.invalidateUserPermissionCache(userId),
      );

      return ResultAsync.combine(invalidations).map(() => {
        this.logger.log(
          `Cache invalidated for ${userIds.length} users with role ${roleId}`,
          'AuthorizationService',
        );
        return userIds.length;
      });
    });
  }
}

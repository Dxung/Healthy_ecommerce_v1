import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AsyncLocalStorage } from 'async_hooks';
import { AUTHORIZATION_SERVICE } from '../tokens/authorization.token';
import type { IAuthorizationService } from '../authorization.service.interface';
import { PERMISSIONS_KEY } from '../constants/authorization.constants';
import type { ITypeORMAlsStore } from 'src/shared/als/interfaces/als-store.interface';
import { AUTHORIZATION_ERRORS } from '../errors/authorization.errors';
import { AuthorizationErrorHttpMapper } from '../errors/authorization-errors-http.mapper';
import { ExceptionSource } from 'src/common/exception filters/exception-source';
import { createDomainError } from 'src/shared/types/domain-error.type';

/**
 * PermissionsGuard - Enforces permission-based access control
 *
 * Flow:
 * 1. Read @Permissions() metadata from route
 * 2. If no permissions required, allow access
 * 3. Get userId from ALS (must run after AuthGuard)
 * 4. Check if user has any of the required permissions
 * 5. Allow if has permission, reject with 403 if not
 *
 * Usage: @UseGuards(AuthGuard, PermissionsGuard)
 *        @Permissions('product:create', 'product:update')
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(AUTHORIZATION_SERVICE)
    private readonly authorizationService: IAuthorizationService,
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Step 1: Read @Permissions() metadata
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Step 2: If no permissions required, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // Step 3: Get userId from ALS (set by AuthGuard)
    const store = this.als.getStore();
    const userId = store?.userId;

    if (!userId) {
      // AuthGuard should have set userId - if not, something is wrong
      throw AuthorizationErrorHttpMapper.toHttpException(
        createDomainError(AUTHORIZATION_ERRORS.USER_NOT_AUTHENTICATED),
        ExceptionSource.GUARD,
      );
    }

    // Step 4: Check permissions
    const result = await this.authorizationService.hasAnyPermission(
      userId,
      requiredPermissions,
    );

    return result.match(
      (hasPermission) => {
        if (hasPermission) {
          return true;
        }

        // Step 5: No permission - reject with 403
        throw AuthorizationErrorHttpMapper.toHttpException(
          createDomainError(AUTHORIZATION_ERRORS.PERMISSION_DENIED),
          ExceptionSource.GUARD,
        );
      },
      (error) => {
        // Database or other error
        throw AuthorizationErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.GUARD,
        );
      },
    );
  }
}

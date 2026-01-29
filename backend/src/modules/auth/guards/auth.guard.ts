import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Inject,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { SESSION_SERVICE } from 'src/modules/session/tokens/session.token';
import type { ISessionService } from 'src/modules/session/session.service.interface';
import { SESSION_COOKIE_NAME } from 'src/modules/session/constants/session.constants';
import { SessionErrorHttpMapper } from 'src/modules/session/errors/session-errors-http.mapper';
import { ExceptionSource } from 'src/common/exception filters/exception-source';
import { AsyncLocalStorage } from 'async_hooks';
import type { ITypeORMAlsStore } from 'src/shared/als/interfaces/als-store.interface';
import { createDomainError } from 'src/shared/types/domain-error.type';
import { SESSION_ERRORS } from 'src/modules/session/errors/session.errors';

/**
 * AuthGuard - Protects routes by verifying session tokens
 *
 * Flow:
 * 1. Extract sessionToken from cookie
 * 2. Verify token and get userId from session service
 * 3. Set userId in ALS (Async Local Storage) for use in the request
 * 4. Allow request if valid, reject if invalid
 *
 * Usage: @UseGuards(AuthGuard)
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(SESSION_SERVICE) private readonly sessionService: ISessionService,
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    //Lấy request và response từ context
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    //Lấy sessionToken từ cookie
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const sessionToken = request.cookies?.[SESSION_COOKIE_NAME];

    if (!sessionToken || typeof sessionToken !== 'string') {
      // No token found in cookie - reject with 401
      throw SessionErrorHttpMapper.toHttpException(
        createDomainError(SESSION_ERRORS.INVALID_SESSION),
        ExceptionSource.GUARD,
      );
    }

    // Step 2: Verify token and get userId and sessionId
    const result = await this.sessionService.verifyAndUpdateToken(sessionToken);

    return result.match(
      ({ userId, sessionId }) => {
        // Step 3: Set userId and sessionId in ALS store
        const store = this.als.getStore();
        if (store) {
          store.userId = userId;
          store.sessionId = sessionId;
        }

        // Step 4: Allow request to continue
        return true;
      },
      (error) => {
        // Session invalid or expired - clear cookie and reject with 401
        // Clear cookie only for session-specific errors
        if (
          error.code === 'SESSION_INVALID_SESSION' ||
          error.code === 'SESSION_SESSION_EXPIRED'
        ) {
          response.clearCookie(SESSION_COOKIE_NAME);
        }

        throw SessionErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.GUARD,
        );
      },
    );
  }
}

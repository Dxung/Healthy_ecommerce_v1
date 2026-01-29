import {
  HttpException,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { SESSION_ERRORS } from './session.errors';
import { ExceptionSource } from 'src/common/exception filters/exception-source';
import type { DomainError } from 'src/shared/types/domain-error.type';
import { SharedErrorHttpMapper } from 'src/shared/errors/shared-errors-http.mapper';

/**
 * SessionErrorHttpMapper is responsible for mapping session-related domain errors
 * to appropriate HTTP exceptions for API responses.
 */
export class SessionErrorHttpMapper {
  static toHttpException(
    error: DomainError,
    source: ExceptionSource,
  ): HttpException {
    const cause = {
      error,
      source,
    };

    switch (error.code) {
      case SESSION_ERRORS.INVALID_SESSION.code:
        return new UnauthorizedException(error.message, {
          cause,
        }); // 401 Unauthorized

      case SESSION_ERRORS.SESSION_EXPIRED.code:
        return new UnauthorizedException(error.message, {
          cause,
        }); // 401 Unauthorized

      case SESSION_ERRORS.SESSION_NOT_FOUND.code:
        return new NotFoundException(error.message, {
          cause,
        }); // 404 Not Found

      case SESSION_ERRORS.UNAUTHORIZED_SESSION_DELETE.code:
        return new ForbiddenException(error.message, {
          cause,
        }); // 403 Forbidden

      default:
        return SharedErrorHttpMapper.toHttpException(error, source);
    }
  }
}

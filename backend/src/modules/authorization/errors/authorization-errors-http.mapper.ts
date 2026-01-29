import {
  HttpException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { AUTHORIZATION_ERRORS } from './authorization.errors';
import { ExceptionSource } from 'src/common/exception filters/exception-source';
import type { DomainError } from 'src/shared/types/domain-error.type';
import { SharedErrorHttpMapper } from 'src/shared/errors/shared-errors-http.mapper';

/**
 * AuthorizationErrorHttpMapper is responsible for mapping authorization-related
 * domain errors to appropriate HTTP exceptions for API responses.
 */
export class AuthorizationErrorHttpMapper {
  static toHttpException(
    error: DomainError,
    source: ExceptionSource,
  ): HttpException {
    const cause = {
      error,
      source,
    };

    switch (error.code) {
      // 401 Unauthorized
      case AUTHORIZATION_ERRORS.USER_NOT_AUTHENTICATED.code:
        return new UnauthorizedException(error.message, { cause });

      // 403 Forbidden
      case AUTHORIZATION_ERRORS.PERMISSION_DENIED.code:
      case AUTHORIZATION_ERRORS.ADMIN_CANNOT_ACCESS_BUYER_FEATURE.code:
        return new ForbiddenException(error.message, { cause });

      // 404 Not Found
      case AUTHORIZATION_ERRORS.ROLE_NOT_FOUND.code:
      case AUTHORIZATION_ERRORS.PERMISSION_NOT_FOUND.code:
      case AUTHORIZATION_ERRORS.USER_NOT_FOUND.code:
        return new NotFoundException(error.message, { cause });

      // 409 Conflict
      case AUTHORIZATION_ERRORS.ROLE_NAME_EXISTS.code:
      case AUTHORIZATION_ERRORS.PERMISSION_NAME_EXISTS.code:
      case AUTHORIZATION_ERRORS.USER_ALREADY_HAS_ROLE.code:
      case AUTHORIZATION_ERRORS.ROLE_ALREADY_HAS_PERMISSION.code:
        return new ConflictException(error.message, { cause });

      // 400 Bad Request
      case AUTHORIZATION_ERRORS.ROLE_HAS_USERS.code:
      case AUTHORIZATION_ERRORS.PERMISSION_HAS_ROLES.code:
      case AUTHORIZATION_ERRORS.ROLE_IS_SYSTEM.code:
      case AUTHORIZATION_ERRORS.USER_DOES_NOT_HAVE_ROLE.code:
      case AUTHORIZATION_ERRORS.ROLE_DOES_NOT_HAVE_PERMISSION.code:
        return new BadRequestException(error.message, { cause });

      default:
        return SharedErrorHttpMapper.toHttpException(error, source);
    }
  }
}

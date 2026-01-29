import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  NotFoundException,
} from '@nestjs/common';
import { USER_ERRORS } from './user.errors';
import { ExceptionSource } from 'src/common/exception filters/exception-source';
import type { DomainError } from 'src/shared/types/domain-error.type';
import { SharedErrorHttpMapper } from 'src/shared/errors/shared-errors-http.mapper';

/**
 * UserErrorHttpMapper is responsible for mapping user-related domain errors
 * to appropriate HTTP exceptions for API responses.
 */
export class UserErrorHttpMapper {
  static toHttpException(
    error: DomainError,
    source: ExceptionSource,
  ): HttpException {
    const cause = {
      error,
      source,
    };

    switch (error.code) {
      case USER_ERRORS.USERNAME_ALREADY_EXISTS.code:
      case USER_ERRORS.PHONE_ALREADY_IN_USE.code:
      case USER_ERRORS.EMAIL_ALREADY_IN_USE.code:
        return new ConflictException(error.message, {
          cause,
        }); // 409 Conflict

      case USER_ERRORS.DATE_OF_BIRTH_ALREADY_CHANGED.code:
      case USER_ERRORS.GENDER_ALREADY_CHANGED.code:
      case USER_ERRORS.PHONE_NOT_CORRECT.code:
      case USER_ERRORS.INVALID_LOCATION_HIERARCHY.code:
      case USER_ERRORS.CANNOT_DELETE_DEFAULT_ADDRESS.code:
      case USER_ERRORS.MAX_ADDRESSES_REACHED.code:
      case USER_ERRORS.AVATAR_UPLOAD_FAILED.code:
      case USER_ERRORS.AVATAR_DELETE_FAILED.code:
      case USER_ERRORS.NO_FILE_UPLOADED.code:
      case USER_ERRORS.USER_ALREADY_SUSPENDED.code:
      case USER_ERRORS.USER_ALREADY_ACTIVE.code:
        return new BadRequestException(error.message, {
          cause,
        }); // 400 Bad Request

      case USER_ERRORS.ADDRESS_NOT_FOUND.code:
      case USER_ERRORS.ADDRESS_NOT_OWNED_BY_USER.code:
      case USER_ERRORS.USER_NOT_FOUND.code:
        return new NotFoundException(error.message, {
          cause,
        }); // 404 Not Found

      case USER_ERRORS.CANNOT_MODIFY_OWN_ACCOUNT.code:
      case USER_ERRORS.CANNOT_MODIFY_SUPER_ADMIN.code:
        return new ForbiddenException(error.message, {
          cause,
        }); // 403 Forbidden

      default:
        return SharedErrorHttpMapper.toHttpException(error, source);
    }
  }
}

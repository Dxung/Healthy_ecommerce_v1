import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { AUTH_ERRORS } from './auth.errors';
import { ExceptionSource } from 'src/common/exception filters/exception-source';
import type { DomainError } from 'src/shared/types/domain-error.type';
import { SharedErrorHttpMapper } from 'src/shared/errors/shared-errors-http.mapper';

/**
 * AuthErrorHttpMapper is responsible for mapping authentication-related domain errors
 * to appropriate HTTP exceptions for API responses.
 */
export class AuthErrorHttpMapper {
  static toHttpException(
    error: DomainError,
    source: ExceptionSource,
  ): HttpException {
    const cause = {
      error,
      source,
    };

    switch (error.code) {
      case AUTH_ERRORS.OTP_TOKEN_EXPIRED.code:
        return new UnauthorizedException(error.message, {
          cause,
          description: error.code,
        });

      case AUTH_ERRORS.INVALID_OTP_TOKEN.code:
      case AUTH_ERRORS.OTP_VERIFICATION_FAILED.code:
        return new UnauthorizedException(error.message, {
          cause,
        }); // 401 Unauthorized

      case AUTH_ERRORS.OTP_VERIFICATION_UNAVAILABLE.code:
        return new ServiceUnavailableException(error.message, {
          cause,
        }); // 503 Service Unavailable

      case AUTH_ERRORS.ACCOUNT_DISABLED.code:
        return new ForbiddenException(error.message, {
          cause,
        }); // 403 Forbidden

      case AUTH_ERRORS.PROVIDER_NOT_CORRECT.code:
      case AUTH_ERRORS.PASSWORD_INCORRECT.code:
        return new UnauthorizedException(error.message, {
          cause,
        }); // 401 Unauthorized

      case AUTH_ERRORS.PHONE_MISMATCH.code:
        return new BadRequestException(error.message, {
          cause,
        }); // 400 Bad Request

      case AUTH_ERRORS.PHONE_NOT_REGISTERED.code:
        return new BadRequestException(error.message, {
          cause,
        }); // 400 Bad Request

      default:
        return SharedErrorHttpMapper.toHttpException(error, source);
    }
  }
}

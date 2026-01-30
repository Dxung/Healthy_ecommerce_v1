import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  NotFoundException,
} from '@nestjs/common';
import { SHOP_ERRORS } from './shop.errors';
import { BADGE_APPLICATION_ERRORS } from './badge-application.errors';
import { ExceptionSource } from 'src/common/exception filters/exception-source';
import type { DomainError } from 'src/shared/types/domain-error.type';
import { SharedErrorHttpMapper } from 'src/shared/errors/shared-errors-http.mapper';

/**
 * ShopErrorHttpMapper is responsible for mapping shop-related domain errors
 * to appropriate HTTP exceptions for API responses.
 */
export class ShopErrorHttpMapper {
  static toHttpException(
    error: DomainError,
    source: ExceptionSource,
  ): HttpException {
    const cause = {
      error,
      source,
    };

    switch (error.code) {
      // 404 Not Found
      case SHOP_ERRORS.REGISTRATION_NOT_FOUND.code:
      case SHOP_ERRORS.SHOP_NOT_FOUND.code:
      case SHOP_ERRORS.BADGE_NOT_FOUND.code:
      case SHOP_ERRORS.DOCUMENT_TYPE_NOT_FOUND.code:
      case SHOP_ERRORS.REQUIREMENT_NOT_FOUND.code:
      case BADGE_APPLICATION_ERRORS.APPLICATION_NOT_FOUND.code:
      case BADGE_APPLICATION_ERRORS.BRAND_NOT_FOUND.code:
      case BADGE_APPLICATION_ERRORS.REQUIREMENT_NOT_FOUND.code:
        return new NotFoundException(error.message, {
          cause,
        });

      // 409 Conflict
      case SHOP_ERRORS.ALREADY_HAS_PENDING_REQUEST.code:
      case SHOP_ERRORS.ALREADY_HAS_SHOP.code:
      case SHOP_ERRORS.SLUG_ALREADY_EXISTS.code:
      case SHOP_ERRORS.SHOP_NAME_ALREADY_EXISTS.code:
      case SHOP_ERRORS.BADGE_ALREADY_EXISTS.code:
      case SHOP_ERRORS.USER_ALREADY_HAS_PHONE.code:
      case BADGE_APPLICATION_ERRORS.ALREADY_HAS_PENDING_APPLICATION.code:
      case BADGE_APPLICATION_ERRORS.ALREADY_OFFICIAL_FOR_BRAND.code:
      case BADGE_APPLICATION_ERRORS.ALREADY_HAS_VERIFIED_BADGE.code:
      case BADGE_APPLICATION_ERRORS.ALREADY_REVOKED.code:
      case BADGE_APPLICATION_ERRORS.REQUIREMENT_ALREADY_EXISTS.code:
        return new ConflictException(error.message, {
          cause,
        });

      // 403 Forbidden
      case BADGE_APPLICATION_ERRORS.NOT_YOUR_APPLICATION.code:
        return new ForbiddenException(error.message, {
          cause,
        });

      // 400 Bad Request
      case SHOP_ERRORS.REGISTRATION_ALREADY_PROCESSED.code:
      case SHOP_ERRORS.MISSING_REQUIRED_DOCUMENTS.code:
      case SHOP_ERRORS.INVALID_BRAND_FOR_OFFICIAL_BADGE.code:
      case SHOP_ERRORS.MISSING_BRAND_DOCUMENTS.code:
      case SHOP_ERRORS.INVALID_REGISTRATION_TOKEN.code:
      case SHOP_ERRORS.PHONE_VERIFICATION_REQUIRED.code:
      case SHOP_ERRORS.PHONE_MISMATCH_WITH_ACCOUNT.code:
      case SHOP_ERRORS.CANNOT_DEACTIVATE.code:
      case SHOP_ERRORS.CANNOT_ACTIVATE.code:
      case SHOP_ERRORS.CANNOT_SUSPEND.code:
      case SHOP_ERRORS.CANNOT_UNSUSPEND.code:
      case SHOP_ERRORS.ALREADY_BANNED.code:
      case SHOP_ERRORS.BADGE_ALREADY_DISABLED.code:
      case SHOP_ERRORS.BADGE_ALREADY_ACTIVE.code:
      case BADGE_APPLICATION_ERRORS.CANNOT_APPROVE_NON_PENDING.code:
      case BADGE_APPLICATION_ERRORS.CANNOT_REJECT_NON_PENDING.code:
      case BADGE_APPLICATION_ERRORS.CANNOT_CANCEL_NON_PENDING.code:
      case BADGE_APPLICATION_ERRORS.MISSING_REQUIRED_DOCUMENTS.code:
      case BADGE_APPLICATION_ERRORS.DOCUMENT_EXPIRED.code:
      case BADGE_APPLICATION_ERRORS.NO_REQUIREMENTS_FOR_BRAND.code:
        return new BadRequestException(error.message, {
          cause,
        });

      default:
        return SharedErrorHttpMapper.toHttpException(error, source);
    }
  }
}

import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  NotFoundException,
} from '@nestjs/common';
import { REVIEW_ERRORS } from './review.errors';
import { ExceptionSource } from 'src/common/exception filters/exception-source';
import type { DomainError } from 'src/shared/types/domain-error.type';
import { SharedErrorHttpMapper } from 'src/shared/errors/shared-errors-http.mapper';

/**
 * ReviewErrorHttpMapper is responsible for mapping review-related domain errors
 * to appropriate HTTP exceptions for API responses.
 */
export class ReviewErrorHttpMapper {
  static toHttpException(
    error: DomainError,
    source: ExceptionSource,
  ): HttpException {
    const cause = {
      error,
      source,
    };

    switch (error.code) {
      // ======================== NOT FOUND (404) ========================
      case REVIEW_ERRORS.ORDER_ITEM_NOT_FOUND.code:
      case REVIEW_ERRORS.REVIEW_NOT_FOUND.code:
      case REVIEW_ERRORS.REPLY_NOT_FOUND.code:
      case REVIEW_ERRORS.ORDER_NOT_FOUND.code:
      case REVIEW_ERRORS.PRODUCT_NOT_FOUND.code:
      case REVIEW_ERRORS.SHOP_NOT_FOUND.code:
        return new NotFoundException(error.message, { cause });

      // ======================== CONFLICT (409) ========================
      case REVIEW_ERRORS.ALREADY_REVIEWED.code:
      case REVIEW_ERRORS.REPLY_ALREADY_EXISTS.code:
        return new ConflictException(error.message, { cause });

      // ======================== FORBIDDEN (403) ========================
      case REVIEW_ERRORS.NOT_REVIEW_OWNER.code:
      case REVIEW_ERRORS.NOT_SHOP_OWNER.code:
      case REVIEW_ERRORS.NOT_ORDER_BUYER.code:
        return new ForbiddenException(error.message, { cause });

      // ======================== BAD REQUEST (400) ========================
      case REVIEW_ERRORS.ORDER_NOT_COMPLETED.code:
      case REVIEW_ERRORS.ITEM_REFUNDED.code:
      case REVIEW_ERRORS.REVIEW_WINDOW_EXPIRED.code:
      case REVIEW_ERRORS.INVALID_RATING.code:
      case REVIEW_ERRORS.REVIEW_CANNOT_MODIFY.code:
        return new BadRequestException(error.message, { cause });

      // ======================== DEFAULT ========================
      default:
        return SharedErrorHttpMapper.toHttpException(error, source);
    }
  }
}

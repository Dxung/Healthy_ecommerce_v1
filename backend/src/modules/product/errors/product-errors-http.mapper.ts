import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  NotFoundException,
} from '@nestjs/common';
import { PRODUCT_ERRORS } from './product.errors';
import { ExceptionSource } from 'src/common/exception filters/exception-source';
import type { DomainError } from 'src/shared/types/domain-error.type';
import { SharedErrorHttpMapper } from 'src/shared/errors/shared-errors-http.mapper';

/**
 * ProductErrorHttpMapper is responsible for mapping product-related domain errors
 * to appropriate HTTP exceptions for API responses.
 */
export class ProductErrorHttpMapper {
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
      case PRODUCT_ERRORS.PRODUCT_NOT_FOUND.code:
      case PRODUCT_ERRORS.CATEGORY_NOT_FOUND.code:
      case PRODUCT_ERRORS.CATEGORY_PARENT_NOT_FOUND.code:
      case PRODUCT_ERRORS.BRAND_NOT_FOUND.code:
      case PRODUCT_ERRORS.IMAGE_NOT_FOUND.code:
      case PRODUCT_ERRORS.VARIANT_NOT_FOUND.code:
      case PRODUCT_ERRORS.OPTION_NOT_FOUND.code:
      case PRODUCT_ERRORS.OPTION_VALUE_NOT_FOUND.code:
      case PRODUCT_ERRORS.SHOP_NOT_FOUND.code:
      case PRODUCT_ERRORS.ALLERGEN_TAG_NOT_FOUND.code:
      case PRODUCT_ERRORS.DIET_TAG_NOT_FOUND.code:
      case PRODUCT_ERRORS.UNIT_NOT_FOUND.code:
      case PRODUCT_ERRORS.UNIT_CONVERSION_NOT_FOUND.code:
        return new NotFoundException(error.message, { cause });

      // ======================== CONFLICT (409) ========================
      case PRODUCT_ERRORS.PRODUCT_SLUG_EXISTS.code:
      case PRODUCT_ERRORS.CATEGORY_SLUG_EXISTS.code:
      case PRODUCT_ERRORS.BRAND_SLUG_EXISTS.code:
      case PRODUCT_ERRORS.VARIANT_SKU_EXISTS.code:
      case PRODUCT_ERRORS.ALLERGEN_TAG_SLUG_EXISTS.code:
      case PRODUCT_ERRORS.DIET_TAG_SLUG_EXISTS.code:
      case PRODUCT_ERRORS.ALLERGEN_TAG_IN_USE.code:
      case PRODUCT_ERRORS.DIET_TAG_IN_USE.code:
      case PRODUCT_ERRORS.UNIT_SYMBOL_EXISTS.code:
      case PRODUCT_ERRORS.UNIT_CONVERSION_EXISTS.code:
        return new ConflictException(error.message, { cause });

      // ======================== FORBIDDEN (403) ========================
      case PRODUCT_ERRORS.PRODUCT_NOT_OWNED.code:
      case PRODUCT_ERRORS.PRODUCT_SUSPENDED.code:
      case PRODUCT_ERRORS.USER_HAS_NO_SHOP.code:
        return new ForbiddenException(error.message, { cause });

      // ======================== BAD REQUEST (400) ========================
      case PRODUCT_ERRORS.PRODUCT_CANNOT_PUBLISH.code:
      case PRODUCT_ERRORS.PRODUCT_CANNOT_EDIT.code:
      case PRODUCT_ERRORS.PRODUCT_ALREADY_ACTIVE.code:
      case PRODUCT_ERRORS.PRODUCT_ALREADY_DRAFT.code:
      case PRODUCT_ERRORS.PRODUCT_ALREADY_INACTIVE.code:
      case PRODUCT_ERRORS.PRODUCT_CANNOT_DEACTIVATE.code:
      case PRODUCT_ERRORS.PRODUCT_CANNOT_ACTIVATE.code:
      case PRODUCT_ERRORS.PRODUCT_CANNOT_HARD_DELETE.code:
      case PRODUCT_ERRORS.PRODUCT_SLOT_LIMIT_REACHED.code:
      case PRODUCT_ERRORS.CATEGORY_HAS_PRODUCTS.code:
      case PRODUCT_ERRORS.CATEGORY_HAS_CHILDREN.code:
      case PRODUCT_ERRORS.CATEGORY_LEVEL_EXCEEDED.code:
      case PRODUCT_ERRORS.BRAND_HAS_PRODUCTS.code:
      case PRODUCT_ERRORS.IMAGE_LIMIT_EXCEEDED.code:
      case PRODUCT_ERRORS.IMAGE_UPLOAD_FAILED.code:
      case PRODUCT_ERRORS.VARIANT_INSUFFICIENT_STOCK.code:
      case PRODUCT_ERRORS.VARIANT_INVALID_PRICE.code:
      case PRODUCT_ERRORS.VARIANT_LAST_CANNOT_DELETE.code:
      case PRODUCT_ERRORS.UNIT_CONVERSION_SAME_UNIT.code:
      case PRODUCT_ERRORS.UNIT_CONVERSION_TYPE_MISMATCH.code:
      case PRODUCT_ERRORS.UNIT_CONVERSION_NOT_AVAILABLE.code:
      case PRODUCT_ERRORS.UNIT_INVALID_SERVING_UNIT.code:
      case PRODUCT_ERRORS.UNIT_INVALID_SELLING_UNIT.code:
        return new BadRequestException(error.message, { cause });

      // ======================== DEFAULT ========================
      default:
        return SharedErrorHttpMapper.toHttpException(error, source);
    }
  }
}

import {
  HttpException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import type { DomainError } from 'src/shared/types/domain-error.type';
import { SharedErrorHttpMapper } from 'src/shared/errors/shared-errors-http.mapper';
import { ExceptionSource } from 'src/common/exception filters/exception-source';
import { CART_ERRORS } from './cart.errors';

export class CartErrorHttpMapper {
  static toHttpException(
    error: DomainError,
    source: ExceptionSource,
  ): HttpException {
    const cause = { error, source };

    switch (error.code) {
      case CART_ERRORS.CART_NOT_FOUND.code:
      case CART_ERRORS.CART_ITEM_NOT_FOUND.code:
      case CART_ERRORS.VARIANT_NOT_FOUND.code:
      case CART_ERRORS.PRODUCT_NOT_FOUND.code:
        return new NotFoundException(error.message, { cause });

      case CART_ERRORS.PRODUCT_NOT_AVAILABLE.code:
      case CART_ERRORS.VARIANT_NOT_ACTIVE.code:
      case CART_ERRORS.INSUFFICIENT_STOCK.code:
        return new ConflictException(error.message, { cause });

      case CART_ERRORS.INVALID_QUANTITY.code:
      case CART_ERRORS.CART_EMPTY.code:
      case CART_ERRORS.NO_ITEMS_SELECTED.code:
        return new BadRequestException(error.message, { cause });

      case CART_ERRORS.CART_ITEM_NOT_OWNED.code:
        return new ForbiddenException(error.message, { cause });

      default:
        return SharedErrorHttpMapper.toHttpException(error, source);
    }
  }
}

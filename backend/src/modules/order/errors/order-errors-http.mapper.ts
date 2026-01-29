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
import { ORDER_ERRORS } from './order.errors';

export class OrderErrorHttpMapper {
  static toHttpException(
    error: DomainError,
    source: ExceptionSource,
  ): HttpException {
    const cause = { error, source };

    switch (error.code) {
      case ORDER_ERRORS.ORDER_NOT_FOUND.code:
      case ORDER_ERRORS.ADDRESS_NOT_FOUND.code:
      case ORDER_ERRORS.SHOP_NOT_FOUND.code:
      case ORDER_ERRORS.ORDER_ITEM_NOT_FOUND.code:
        return new NotFoundException(error.message, { cause });

      case ORDER_ERRORS.ORDER_NOT_OWNED.code:
      case ORDER_ERRORS.ADDRESS_NOT_OWNED.code:
      case ORDER_ERRORS.NO_SHOP_PERMISSION.code:
        return new ForbiddenException(error.message, { cause });

      case ORDER_ERRORS.ORDER_NOT_CANCELLABLE.code:
      case ORDER_ERRORS.ORDER_INVALID_STATUS_TRANSITION.code:
      case ORDER_ERRORS.PRODUCT_UNAVAILABLE.code:
      case ORDER_ERRORS.INSUFFICIENT_STOCK.code:
      case ORDER_ERRORS.PRICE_CHANGED.code:
      case ORDER_ERRORS.SHOP_NOT_ACTIVE.code:
      case ORDER_ERRORS.BUYER_CANNOT_CANCEL.code:
      case ORDER_ERRORS.SHOP_CANNOT_CANCEL.code:
      case ORDER_ERRORS.CANNOT_CONFIRM_DELIVERY.code:
      case ORDER_ERRORS.INSUFFICIENT_COINS.code:
      case ORDER_ERRORS.PAYMENT_FAILED.code:
      case ORDER_ERRORS.INSUFFICIENT_WALLET_BALANCE.code:
      case ORDER_ERRORS.ITEM_ALREADY_REFUNDED.code:
        return new ConflictException(error.message, { cause });

      case ORDER_ERRORS.CART_EMPTY.code:
      case ORDER_ERRORS.NO_ITEMS_SELECTED.code:
        return new BadRequestException(error.message, { cause });

      default:
        return SharedErrorHttpMapper.toHttpException(error, source);
    }
  }
}

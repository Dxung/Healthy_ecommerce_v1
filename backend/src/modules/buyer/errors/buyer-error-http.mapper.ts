import {
  HttpException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import type { DomainError } from 'src/shared/types/domain-error.type';
import { SharedErrorHttpMapper } from 'src/shared/errors/shared-errors-http.mapper';
import { ExceptionSource } from 'src/common/exception filters/exception-source';
import { BUYER_ERRORS } from './buyer.errors';

export class BuyerErrorHttpMapper {
  static toHttpException(
    error: DomainError,
    source: ExceptionSource,
  ): HttpException {
    const cause = { error, source };

    switch (error.code) {
      case BUYER_ERRORS.COIN_WALLET_NOT_FOUND.code:
        return new NotFoundException(error.message, { cause });

      case BUYER_ERRORS.INSUFFICIENT_COIN_BALANCE.code:
      case BUYER_ERRORS.INVALID_COIN_AMOUNT.code:
        return new BadRequestException(error.message, { cause });

      default:
        return SharedErrorHttpMapper.toHttpException(error, source);
    }
  }
}

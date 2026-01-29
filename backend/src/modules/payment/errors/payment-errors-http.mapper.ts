import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import type { DomainError } from 'src/shared/types/domain-error.type';
import { ExceptionSource } from 'src/common/exception filters/exception-source';
import { PAYMENT_ERRORS } from './payment.errors';
import { SharedErrorHttpMapper } from 'src/shared/errors/shared-errors-http.mapper';

export class PaymentErrorHttpMapper {
  static toHttpException(
    error: DomainError,
    source: ExceptionSource,
  ): HttpException {
    const cause = {
      error,
      source,
    };

    switch (error.code) {
      case PAYMENT_ERRORS.WALLET_NOT_FOUND.code:
      case PAYMENT_ERRORS.ESCROW_NOT_FOUND.code:
      case PAYMENT_ERRORS.PAYMENT_NOT_FOUND.code:
      case PAYMENT_ERRORS.PENDING_RELEASE_NOT_FOUND.code:
        return new NotFoundException(error.message, { cause });

      case PAYMENT_ERRORS.INSUFFICIENT_BALANCE.code:
      case PAYMENT_ERRORS.INVALID_AMOUNT.code:
      case PAYMENT_ERRORS.TOPUP_MIN_AMOUNT.code:
      case PAYMENT_ERRORS.TOPUP_MAX_AMOUNT.code:
      case PAYMENT_ERRORS.PENDING_RELEASE_NOT_FAILED.code:
        return new BadRequestException(error.message, { cause });

      case PAYMENT_ERRORS.PAYMENT_EXPIRED.code:
      case PAYMENT_ERRORS.PAYMENT_ALREADY_PROCESSED.code:
      case PAYMENT_ERRORS.ESCROW_ALREADY_RELEASED.code:
        return new BadRequestException(error.message, { cause });

      case PAYMENT_ERRORS.VNPAY_SIGNATURE_INVALID.code:
        return new ForbiddenException(error.message, { cause });

      case PAYMENT_ERRORS.VNPAY_TRANSACTION_FAILED.code:
      case PAYMENT_ERRORS.VNPAY_CONFIG_ERROR.code:
        return new InternalServerErrorException(error.message, { cause });

      default:
        return SharedErrorHttpMapper.toHttpException(error, source);
    }
  }
}

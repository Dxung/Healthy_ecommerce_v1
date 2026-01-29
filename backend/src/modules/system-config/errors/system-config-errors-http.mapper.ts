import {
  HttpException,
  HttpStatus,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import type { DomainError } from 'src/shared/types/domain-error.type';
import { ExceptionSource } from 'src/common/exception filters/exception-source';
import { SYSTEM_CONFIG_ERRORS } from './system-config.errors';
import { SHARED_ERRORS } from 'src/shared/errors/shared.errors';

export class SystemConfigErrorHttpMapper {
  static toHttpException(
    error: DomainError,
    source: ExceptionSource,
  ): HttpException {
    const { code, message } = error;

    switch (code) {
      case SYSTEM_CONFIG_ERRORS.CONFIG_NOT_FOUND.code:
        return new NotFoundException({ errorCode: code, message, source });

      case SYSTEM_CONFIG_ERRORS.INVALID_VALUE.code:
        return new BadRequestException({ errorCode: code, message, source });

      case SHARED_ERRORS.DB_ERROR.code:
        return new InternalServerErrorException({
          errorCode: code,
          message: 'Đã xảy ra lỗi hệ thống.',
          source,
        });

      default:
        return new HttpException(
          { errorCode: code, message, source },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }
  }
}

import { ExceptionSource } from 'src/common/exception filters/exception-source';
import { DomainError } from '../types/domain-error.type';
import {
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { SHARED_ERRORS } from './shared.errors';

export class SharedErrorHttpMapper {
  static toHttpException(
    error: DomainError,
    source: ExceptionSource,
  ): HttpException {
    const cause = {
      error,
      source,
    };
    switch (error.code) {
      case SHARED_ERRORS.TOO_MANY_REQUESTS.code:
        return new HttpException(error.message, HttpStatus.TOO_MANY_REQUESTS, {
          cause,
        }); // 429 Too Many Requests

      case SHARED_ERRORS.CACHE_SERVICE_UNAVAILABLE.code:
        return new ServiceUnavailableException(error.message, {
          cause,
        }); // 503 Service Unavailable

      default:
        return new InternalServerErrorException(error.message, {
          cause,
        }); // 500 Internal Server Error
    }
  }
}

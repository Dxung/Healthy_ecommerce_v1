import {
  BadRequestException,
  HttpException,
  NotFoundException,
} from '@nestjs/common';
import { LOCATION_ERRORS } from './location.errors';
import { ExceptionSource } from 'src/common/exception filters/exception-source';
import type { DomainError } from 'src/shared/types/domain-error.type';
import { SharedErrorHttpMapper } from 'src/shared/errors/shared-errors-http.mapper';

/**
 * LocationErrorHttpMapper is responsible for mapping location-related domain errors
 * to appropriate HTTP exceptions for API responses.
 */
export class LocationErrorHttpMapper {
  static toHttpException(
    error: DomainError,
    source: ExceptionSource,
  ): HttpException {
    const cause = {
      error,
      source,
    };

    switch (error.code) {
      case LOCATION_ERRORS.PROVINCE_NOT_FOUND.code:
      case LOCATION_ERRORS.DISTRICT_NOT_FOUND.code:
      case LOCATION_ERRORS.WARD_NOT_FOUND.code:
        return new NotFoundException(error.message, {
          cause,
        }); // 404 Not Found

      case LOCATION_ERRORS.LOCATION_HIERARCHY_INVALID.code:
      case LOCATION_ERRORS.LOCATION_DATA_NOT_AVAILABLE.code:
        return new BadRequestException(error.message, {
          cause,
        }); // 400 Bad Request

      default:
        return SharedErrorHttpMapper.toHttpException(error, source);
    }
  }
}

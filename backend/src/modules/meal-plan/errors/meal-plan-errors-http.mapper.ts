import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  NotFoundException,
} from '@nestjs/common';
import { MEAL_PLAN_ERRORS } from './meal-plan.errors';
import { ExceptionSource } from 'src/common/exception filters/exception-source';
import type { DomainError } from 'src/shared/types/domain-error.type';
import { SharedErrorHttpMapper } from 'src/shared/errors/shared-errors-http.mapper';

/**
 * MealPlanErrorHttpMapper is responsible for mapping meal-plan-related domain errors
 * to appropriate HTTP exceptions for API responses.
 */
export class MealPlanErrorHttpMapper {
  static toHttpException(
    error: DomainError,
    source: ExceptionSource,
  ): HttpException {
    const cause = {
      error,
      source,
    };

    switch (error.code) {
      case MEAL_PLAN_ERRORS.HEALTH_PROFILE_NOT_FOUND.code:
      case MEAL_PLAN_ERRORS.PRESET_NOT_FOUND.code:
      case MEAL_PLAN_ERRORS.MEAL_LOG_NOT_FOUND.code:
      case MEAL_PLAN_ERRORS.EXERCISE_LOG_NOT_FOUND.code:
      case MEAL_PLAN_ERRORS.PRODUCT_NOT_FOUND.code:
      case MEAL_PLAN_ERRORS.USER_NOT_FOUND.code:
        return new NotFoundException(error.message, {
          cause,
        }); // 404 Not Found

      case MEAL_PLAN_ERRORS.PRESET_NOT_OWNED.code:
      case MEAL_PLAN_ERRORS.MEAL_LOG_NOT_OWNED.code:
      case MEAL_PLAN_ERRORS.EXERCISE_LOG_NOT_OWNED.code:
        return new ForbiddenException(error.message, {
          cause,
        }); // 403 Forbidden

      case MEAL_PLAN_ERRORS.PRODUCT_NO_NUTRITION.code:
      case MEAL_PLAN_ERRORS.CANNOT_FOLLOW_SELF.code:
        return new BadRequestException(error.message, {
          cause,
        }); // 400 Bad Request

      default:
        return SharedErrorHttpMapper.toHttpException(error, source);
    }
  }
}

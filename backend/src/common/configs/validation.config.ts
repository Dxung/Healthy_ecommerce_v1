import { BadRequestException, ValidationPipeOptions } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { ExceptionSource } from '../exception filters/exception-source';

/**
 * Generates validation pipe options based on the environment.
 * @param isProduction - Indicates if the environment is production.
 * @returns ValidationPipeOptions configured for the given environment.
 * @note
 *
 *- transform: Enables transformation of input data to DTO instances.
 *- whitelist: Strips properties that do not have any decorators.
 *- stopAtFirstError: Collects all validation errors instead of stopping at the first one.
 *- validationError: Configures the details included in validation errors.
 *- forbidUnknownValues: Forbids unknown values during validation.
 *- enableDebugMessages: Enables detailed debug messages in non-production environments.
 *- skipMissingProperties, skipNullProperties, skipUndefinedProperties: Ensures all properties are validated.
 *- exceptionFactory: Customizes the exception thrown on validation failure to include formatted error messages.
 */
export const getValidationPipeOptions = (
  isProduction: boolean,
): ValidationPipeOptions => {
  return {
    transform: true,
    whitelist: true,
    stopAtFirstError: false,
    validationError: {
      target: false,
      value: false,
    },
    forbidUnknownValues: true,
    enableDebugMessages: !isProduction,
    skipMissingProperties: false,
    skipNullProperties: false,
    skipUndefinedProperties: false,

    exceptionFactory: (errors: ValidationError[]) => {
      const formattedErrors = errors.map((error) => {
        if (isProduction || !error.constraints) {
          return {
            field: error.property,
            errors: [`${error.property} is invalid`],
          };
        }
        return {
          field: error.property,
          errors: Object.values(error.constraints || {}),
        };
      });

      return new BadRequestException(
        {
          message: 'Validation failed',
          errors: formattedErrors, // Available in response body for frontend
        },
        {
          cause: {
            source: ExceptionSource.VALIDATION_PIPE,
            details: formattedErrors, // Available in cause for logging
          },
        },
      );
    },
  };
};

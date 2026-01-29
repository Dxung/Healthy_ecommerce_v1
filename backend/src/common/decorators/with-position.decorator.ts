/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import type { Result, ResultAsync } from 'neverthrow';
import {
  isDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';

/**
 * A decorator that adds positional information to errors in Result or ResultAsync types.
 * @param target - The target object.
 * @param propertyKey - The name of the method being decorated.
 * @param descriptor - The property descriptor of the method.
 * @returns The modified property descriptor with error position information added.
 * @note This decorator only used for methods that return a Result or ResultAsync type.
 */
export function WithPosition() {
  return function <
    T extends Result<any, DomainError> | ResultAsync<any, DomainError>,
  >(
    target: { constructor: { name: string } },
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<(...args: any[]) => T>,
  ): TypedPropertyDescriptor<(...args: any[]) => T> {
    const originalMethod = descriptor.value;

    //in case the decorator is used on a non-method
    if (!originalMethod) return descriptor;

    const className = target.constructor.name;
    const currentStep = `from class: ${className} in function: ${propertyKey}`;

    descriptor.value = function (...args: any[]): T {
      const result = originalMethod.apply(this, args);

      if (result?.mapErr && typeof result.mapErr === 'function') {
        return result.mapErr((error: unknown) => {
          if (!isDomainError(error)) {
            return error;
          }

          return {
            ...error,
            position: error.position
              ? [currentStep, ...error.position]
              : [currentStep],
          };
        }) as T;
      }
      return result as T;
    };

    return descriptor;
  };
}

/**
 * Represents a custom domain error with specific properties.
 * @property {true} _isDomainError - A flag indicating this is a custom domain error.
 * @property {string} code - A unique error code identifying the type of error.
 * @property {string} message - A descriptive message explaining the error.
 * @property {unknown} cause - Reference to the original error or previous error
 * @property {string[]} [position] - Optional array indicating the current position (class and method names) related to the error.
 */
export type DomainError = {
  readonly _isDomainError: true;
  readonly code: string;
  readonly message: string;
  readonly cause: unknown;
  position?: string[];
};

/**
 * Creates a DomainError object.
 * @param definitions - Object containing the error code and message.
 * @param options - Optional object containing cause and position.
 * @returns DomainError object created.
 */
export function createDomainError(
  definitions: {
    code: string;
    message: string;
  },
  options?: {
    cause?: unknown;
    position?: string[];
  },
): DomainError {
  return {
    _isDomainError: true,
    code: definitions.code,
    message: definitions.message,
    cause: options?.cause,
    position: options?.position,
  };
}

/**
 * Type Guard to check if an error is a DomainError.
 * @param error The error object to be checked.
 * @returns True if the error is a DomainError, false otherwise.
 */
export function isDomainError(error: unknown): error is DomainError {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as Record<string, unknown>)._isDomainError === true
  );
}

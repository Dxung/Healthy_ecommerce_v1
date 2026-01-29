import { PostgresError } from './type-guard.database';

/**
 * Interface representing sanitized PostgreSQL error for safe logging.
 * Contains only non-sensitive fields that are safe to log to third-party services.
 */
export interface SanitizedPostgresError {
  code: string;
  severity?: string;
  name?: string;
}

/**
 * Sanitizes a PostgreSQL error by extracting only safe fields for logging.
 * Removes sensitive information like table names, schema, constraints, and details.
 * @param error - The PostgreSQL error to sanitize
 * @returns A sanitized error object safe for logging
 */
export function sanitizePostgresError(
  error: PostgresError,
): SanitizedPostgresError {
  return {
    code: error.code,
    severity: error.severity,
    name: error.name,
  };
}

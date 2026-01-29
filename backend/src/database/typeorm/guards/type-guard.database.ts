import { QueryFailedError } from 'typeorm';

/**
 * Interface representing a PostgreSQL error object structure that got from TypeORM.
 */
export interface PostgresError {
  code: string;
  constraint?: string;
  length?: number;
  name?: string;
  severity?: string;
  detail?: string;
  schema?: string;
  table?: string;
  file?: string;
  line?: string;
  routine?: string;
}

/**
 * Type guard to check if an error is a QueryFailedError from typeorm and specifically a PostgreSQL error.
 * @param error - The error object to check.
 * @returns True if the error is a QueryFailedError with PostgreSQL error details, false otherwise.
 */
export function isQueryFailedPostgresError(
  error: unknown,
): error is QueryFailedError & { driverError: PostgresError } {
  return (
    error instanceof QueryFailedError && // 1. Đúng loại lỗi của TypeORM
    typeof error.driverError === 'object' && // 2. driverError tồn tại dạng object
    error.driverError !== null && // 3. Chặn trường hợp null (vì typeof null === 'object')
    'code' in error.driverError && // 4. Kiểm tra có thuộc tính 'code'
    typeof (error.driverError as Record<string, any>).code === 'string' // 5. Đảm bảo code là chuỗi (VD: '23505')
  );
}

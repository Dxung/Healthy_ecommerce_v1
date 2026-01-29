import { AsyncLocalStorage } from 'async_hooks';
import { ICustomLoggerService } from './interfaces/custom-logger.service.interface';
import { ITypeORMAlsStore } from '../als/interfaces/als-store.interface';
import { formatVNTime } from 'src/common/utils/format-VN-time.util';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AlsLoggerService extends Logger implements ICustomLoggerService {
  constructor(private readonly als: AsyncLocalStorage<ITypeORMAlsStore>) {
    super('');
  }

  /**
   * Write a 'log' level log with request context metadata
   * @param message: The message to log
   * @param context: Optional context to override the default context (if not provided, uses the default context)
   * @example
   * [Nest] 12345  - 15/11/2025, 14:30:01     LOG [MyService] [15/11/2025 14:30:01] [RequestId: 123e4567-e89b-12d3-a456-426614174000] [UserId: user-789] This is a log message.
   */
  log(message: string, context?: string): void {
    const metaData = this.metaData;
    const formattedMessage = this.formatMessage(message, metaData);
    super.log(formattedMessage, context || this.context);
  }

  /**
   * Write an 'error' level log with request context metadata and optional stack trace
   * @param message: The error message to log
   * @param trace: Optional stack trace (can be manually provided) - or can be used to pass the error.stack in try-catch blocks
   * @param context: Optional context to override the default context (if not provided, uses the default context)
   * @example
   * [Nest] 12345  - 15/11/2025, 14:30:01   ERROR [MyService] [15/11/2025 14:30:01] [RequestId: 123e4567-e89b-12d3-a456-426614174000] [UserId: user-789] This is an error message.
   * Error: Something went wrong
   *      at MyService.someMethod (/app/my.service.ts:45:11)
   *      ...
   */
  error(message: string, trace?: string, context?: string): void {
    const metaData = this.metaData;
    const formattedMessage = this.formatMessage(message, metaData);
    super.error(formattedMessage, trace, context || this.context);
  }

  /**
   * Write a 'warn' level log with request context metadata
   * @param message: The warning message to log
   * @param context: Optional context to override the default context (if not provided, uses the default context)
   * @example
   * [Nest] 12345  - 15/11/2025, 14:30:01    WARN [MyService] [15/11/2025 14:30:01] [RequestId: 123e4567-e89b-12d3-a456-426614174000] [UserId: user-789] This is a warning message.   */
  warn(message: string, context?: string): void {
    const metaData = this.metaData;
    const formattedMessage = this.formatMessage(message, metaData);
    super.warn(formattedMessage, context || this.context);
  }

  /**
   * Write a 'debug' level log with request context metadata
   * @param message: The debug message to log
   * @param context: Optional context to override the default context (if not provided, uses the default context)
   * @example
   * [Nest] 12345  - 15/11/2025, 14:30:01   DEBUG [MyService] [15/11/2025 14:30:01] [RequestId: 123e4567-e89b-12d3-a456-426614174000] [UserId: user-789] This is a debug message.
   */
  debug(message: string, context?: string): void {
    const metaData = this.metaData;
    const formattedMessage = this.formatMessage(message, metaData);
    super.debug(formattedMessage, context || this.context);
  }

  /**
   * Write a 'verbose' level log with request context metadata
   * @param message: The verbose message to log
   * @param context: Optional context to override the default context (if not provided, uses the default context)
   * @example
   * [Nest] 12345  - 15/11/2025, 14:30:01 VERBOSE [MyService] [15/11/2025 14:30:01] [RequestId: 123e4567-e89b-12d3-a456-426614174000] [UserId: user-789] This is a verbose message.
   */
  verbose(message: string, context?: string): void {
    const metaData = this.metaData;
    const formattedMessage = this.formatMessage(message, metaData);
    super.verbose(formattedMessage, context || this.context);
  }

  /**
   * Formats the log message with metadata
   * NestJS Logger will automatically apply colors based on log level
   */
  private formatMessage(
    message: string,
    metaData: { requestId: string; userId: string; timestamp: string },
  ): string {
    const separator = '\n' + '-'.repeat(80);
    return `[${metaData.timestamp}] [RequestId: ${metaData.requestId}] [UserId: ${metaData.userId}] ${message}${separator}`;
  }

  /**
   * Getter to get metadata from AsyncLocalStorage
   * @returns An object containing requestId, userId, and timestamp
   * * If store is not available, returns 'No-Context'.
   * * If store is available but specific fields are missing, returns 'No-<field-name>'.
   */
  private get metaData() {
    const store = this.als.getStore();
    const inContext = store !== undefined && store !== null;
    return {
      requestId: inContext
        ? (store.requestId ?? 'No-Request-Id')
        : 'No-Context',
      userId: inContext ? (store.userId ?? 'No-User-Id') : 'No-Context',
      timestamp: formatVNTime(new Date(), true),
    };
  }
}

export interface ICustomLoggerService {
  /**
   * Logs a standard message.
   * @param message The message to log
   * @param context Optional context to override the default context
   */
  log(message: string, context?: string): void;

  /**
   * Logs an error message with optional stack trace.
   * @param message The error message to log
   * @param trace Optional stack trace
   * @param context Optional context to override the default context
   */
  error(message: string, trace?: string, context?: string): void;

  /**
   * Logs a warning message.
   * @param message The warning message to log
   * @param context Optional context to override the default context
   */
  warn(message: string, context?: string): void;

  /**
   * Logs a debug message.
   * @param message The debug message to log
   * @param context Optional context to override the default context
   */
  debug(message: string, context?: string): void;

  /**
   * Logs a verbose message.
   * @param message The verbose message to log
   * @param context Optional context to override the default context
   */
  verbose(message: string, context?: string): void;
}

// system-error.formatter.ts (file mới)
export class SystemErrorFormatter {
  /**
   * Format system-level errors (non-HTTP exceptions) for logging
   * @param error The error that occurred outside HTTP exception handling
   * @param context Request context information
   * @returns Formatted string with full error details for debugging
   */
  static format(
    error: unknown,
    context: { endpoint: string; method: string },
  ): string {
    const parts: string[] = [];

    parts.push(`[SYSTEM CRASH] ${context.method} ${context.endpoint}`);
    parts.push('Error Details:');

    try {
      if (error instanceof Error) {
        const errorObj: Record<string, unknown> = {
          name: error.name,
          message: error.message,
          stack: error.stack,
        };

        // Only include cause if it exists
        if ('cause' in error && error.cause !== undefined) {
          errorObj.cause = error.cause;
        }

        parts.push(JSON.stringify(errorObj, null, 2));
      } else {
        parts.push(JSON.stringify(error, null, 2));
      }
    } catch {
      parts.push(`[Unserializable Error] ${String(error)}`);
    }

    return parts.join('\n');
  }
}

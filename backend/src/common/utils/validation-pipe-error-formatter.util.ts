export class ValidationPipeErrorFormatter {
  /**
   * Format validation errors with optional context.
   * @param details The validation error details
   * @param context Optional context including endpoint and method
   * @returns A formatted string representing the validation errors
   */
  static formatWithContext(
    details: unknown,
    context?: { endpoint?: string; method?: string },
  ): string {
    const parts: string[] = [];

    parts.push('Validation Error Context:');
    if (context?.endpoint) parts.push(`   Endpoint: ${context.endpoint}`);
    if (context?.method) parts.push(`   Method: ${context.method}`);

    //Check if details is null or undefined
    if (details == null) {
      return parts.join('\n');
    }

    //Now details existed
    parts.push('Validation Errors:');

    //If details is not in expected format, just stringify it
    if (!this.isValidationErrorArray(details)) {
      parts.push('   <Invalid format> Raw data below:');
      parts.push(`   ${this.safeStringify(details)}`);
      return parts.join('\n');
    }

    // Now we are sure details is Array<{ field: string; errors: string[] }>
    //But if it's empty, indicate no errors
    if (details.length === 0) {
      parts.push('   <No errors detected>');
      return parts.join('\n');
    }

    // Format each validation error
    details.forEach((error, i) => {
      parts.push(`   ${i + 1}. Field "${error.field}":`);
      error.errors.forEach((msg) => {
        parts.push(`      - ${msg}`);
      });
    });

    return parts.join('\n');
  }

  //-------------------------------- Private helper methods --------------------------------//

  /**
   * Type Guard to check if value is an array of validation error objects.
   * @param value The value to check
   * @returns True if value is an array of validation error objects, false otherwise
   */
  private static isValidationErrorArray(
    value: unknown,
  ): value is Array<{ field: string; errors: string[] }> {
    if (!Array.isArray(value)) return false;

    return value.every((item) => {
      if (typeof item !== 'object' || item === null) return false;

      const obj = item as Record<string, unknown>;

      return (
        typeof obj.field === 'string' &&
        Array.isArray(obj.errors) &&
        obj.errors.every((e) => typeof e === 'string')
      );
    });
  }

  /**
   * Safely stringify a value for logging.
   * @param value The value to stringify
   * @returns A string representation of the value
   */
  private static safeStringify(value: unknown): string {
    try {
      if (value instanceof Error) return value.stack || value.message;
      if (typeof value === 'string') return value;
      return JSON.stringify(value);
    } catch {
      return '[Unserializable Object]';
    }
  }
}

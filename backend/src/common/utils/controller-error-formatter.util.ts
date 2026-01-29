import {
  isDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';

export class ControllerErrorFormatter {
  /**
   * Format a DomainError into a readable string.
   * @param error The error to format
   * @param context Optional context including endpoint and method
   * @param maxDepth The maximum depth to traverse in the error chain
   * @returns A formatted string representing the error and its causes
   */
  static formatDomainErrorWithContext(
    error: unknown,
    context?: {
      endpoint?: string;
      method?: string;
    },
    maxDepth = 15,
  ): string {
    const parts: string[] = [];

    parts.push('Error Context:');
    if (context?.endpoint) parts.push(`  Endpoint: ${context.endpoint}`);
    if (context?.method) parts.push(`  Method: ${context.method}`);
    parts.push('Error Details:');

    if (error === null || error === undefined) {
      parts.push('  <No error provided>');
      return parts.join('\n');
    }

    parts.push(this.chainToTree(error, maxDepth));

    return parts.join('\n');
  }

  //-------------------------------- Private helper methods --------------------------------//

  /**
   * Convert error chain to a tree-like string representation.
   * @param error The error to convert
   * @param maxDepth The maximum depth to traverse
   * @param depth Current depth in the recursion
   * @returns A string representing the error chain in a tree format
   */
  private static chainToTree(error: unknown, maxDepth = 15, depth = 0): string {
    if (depth >= maxDepth) {
      return `${'   '.repeat(depth)}└─ ... (max depth reached)`;
    }

    const indent = '   '.repeat(depth);
    const prefix = depth === 0 ? '' : '└─ Caused by: ';

    let content: string;

    if (isDomainError(error)) {
      content = this.formatDomainError(error);
      let result = `${indent}${prefix}${content}`;

      if (error.cause !== undefined && error.cause !== null) {
        result += '\n' + this.chainToTree(error.cause, maxDepth, depth + 1);
      }

      return result;
    } else if (error instanceof Error) {
      content = this.formatOriginalError(error);
    } else {
      content = this.formatOtherTypeError(error);
    }

    return `${indent}${prefix}${content}`;
  }

  private static formatDomainError(error: DomainError): string {
    let result = `[${error.code}] ${error.message}`;

    if (error.position?.length) {
      result += ` | position: ${error.position.join(' -> ')}`;
    }

    return result;
  }

  private static formatOriginalError(error: Error): string {
    return `[NativeError] ${error.name}: ${error.message}`;
  }

  private static formatOtherTypeError(error: unknown): string {
    if (typeof error === 'string') {
      return `[StringError] ${error}`;
    }

    if (typeof error === 'number') {
      return `[NumberError] ${error}`;
    }

    try {
      return `[UnknownError] ${JSON.stringify(error)}`;
    } catch {
      return `[UnknownError] (non-serializable)`;
    }
  }
}

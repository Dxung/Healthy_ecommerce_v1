/**
 * Error utility functions for handling API errors
 */

export interface ApiErrorResponse {
  message: string;
  statusCode?: number;
  error?: string;
  description?: string;
}

/**
 * Checks if a 401 error is specifically an OTP token expired error
 * OTP_TOKEN_EXPIRED errors have a 'description' field set to the error code
 */
export function isOtpTokenExpiredError(errorData: ApiErrorResponse): boolean {
  return errorData.description === 'AUTH_OTP_TOKEN_EXPIRED';
}

/**
 * Checks if the error response indicates an OTP-related error
 * (vs internal token error)
 */
export function isOtpRelatedError(errorData: ApiErrorResponse): boolean {
  const otpErrorCodes = [
    'AUTH_OTP_TOKEN_EXPIRED',
    'AUTH_INVALID_OTP_TOKEN',
    'AUTH_OTP_VERIFICATION_FAILED',
  ];
  return otpErrorCodes.includes(errorData.error || '');
}

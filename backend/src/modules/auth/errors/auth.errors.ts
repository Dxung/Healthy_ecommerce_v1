/**
 * Collection for Auth module error definitions.
 * Provide standardized error codes and messages for authentication-related errors.
 */
export const AUTH_ERRORS = {
  INVALID_OTP_TOKEN: {
    code: 'AUTH_INVALID_OTP_TOKEN',
    message: 'The provided authentication token is invalid.',
  },
  OTP_TOKEN_EXPIRED: {
    code: 'AUTH_OTP_TOKEN_EXPIRED',
    message: 'The OTP authentication token has expired.',
  },
  OTP_VERIFICATION_FAILED: {
    code: 'AUTH_OTP_VERIFICATION_FAILED',
    message: 'OTP verification failed.',
  },
  OTP_VERIFICATION_UNAVAILABLE: {
    code: 'AUTH_OTP_VERIFICATION_UNAVAILABLE',
    message: 'OTP verification service is currently unavailable.',
  },
  ACCOUNT_DISABLED: {
    code: 'AUTH_ACCOUNT_DISABLED',
    message: 'The user account is disabled.',
  },
  PROVIDER_NOT_CORRECT: {
    code: 'AUTH_PROVIDER_NOT_CORRECT',
    message: 'Invalid credentials. Please check your login ID and password.',
  },
  PASSWORD_INCORRECT: {
    code: 'AUTH_PASSWORD_INCORRECT',
    message: 'Mật khẩu cũ không đúng, vui lòng kiểm tra lại.',
  },
  PHONE_MISMATCH: {
    code: 'AUTH_PHONE_MISMATCH',
    message: 'Số điện thoại không khớp với mã OTP.',
  },
  PHONE_NOT_REGISTERED: {
    code: 'AUTH_PHONE_NOT_REGISTERED',
    message: 'Số điện thoại chưa được đăng ký.',
  },
} as const satisfies Record<string, { code: string; message: string }>;

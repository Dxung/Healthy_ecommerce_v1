export const ValidationErrorCodes = {
  USERNAME_INVALID: 'Username invalid format.',
  USERNAME_TOO_LONG: 'Username exceeds maximum length.',
  PASSWORD_TOO_WEAK: 'Password is too weak.',
  PASSWORD_TOO_LONG: 'Password exceeds maximum length.',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters.',
  LOGIN_ID_TOO_LONG: 'Login ID exceeds maximum length.',
  EXTERNAL_TOKEN_REQUIRED: 'External token is required.',
  EXTERNAL_TOKEN_INVALID: 'External token must be a string.',
  RESET_TOKEN_REQUIRED: 'Reset token is required.',
  RESET_TOKEN_INVALID: 'Reset token must be a string.',
  NEW_PASSWORD_REQUIRED: 'New password is required.',
  NEW_PASSWORD_INVALID: 'New password must be a string.',
} as const;

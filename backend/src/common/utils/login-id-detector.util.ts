import { LoginIdType } from 'src/modules/auth/enums/user_auth.enum';

/**
 * Regex patterns for detecting login ID types
 */
const LOGIN_ID_PATTERNS = {
  // Username: 6-30 characters, alphanumeric and underscore only
  USERNAME: /^(?=.{6,30}$)[a-zA-Z0-9_]+$/,
  // Phone: +84 followed by exactly 9 digits
  PHONE: /^\+84\d{9}$/,
  // Email: standard email format
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
};

/**
 * Detects the type of login identifier (username, email, or phone)
 * @param loginId - The login identifier to check
 * @returns LoginIdType enum value indicating the type of identifier
 */
export function detectLoginIdType(loginId: string): LoginIdType {
  if (!loginId || typeof loginId !== 'string') {
    return LoginIdType.UNKNOWN;
  }

  const trimmedLoginId = loginId.trim();

  // Check in order: phone, email, username
  // Phone is checked first as it has the most specific format
  if (LOGIN_ID_PATTERNS.PHONE.test(trimmedLoginId)) {
    return LoginIdType.PHONE;
  }

  if (LOGIN_ID_PATTERNS.EMAIL.test(trimmedLoginId)) {
    return LoginIdType.EMAIL;
  }

  if (LOGIN_ID_PATTERNS.USERNAME.test(trimmedLoginId)) {
    return LoginIdType.USERNAME;
  }

  return LoginIdType.UNKNOWN;
}

/**
 * Validates Vietnamese phone number format
 * Only accepts +84 followed by exactly 9 digits
 * Example: +84912345678
 *
 * IMPORTANT: This function automatically trims the input before validation
 *
 * @param phoneNumber - The phone number to validate (will be trimmed)
 * @returns true if valid Vietnamese phone format, false otherwise
 */
export function isValidVietnamesePhone(phoneNumber: string | null | undefined): boolean {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return false;
  }

  // IMPORTANT: Always trim phone numbers before processing
  const trimmedPhone = phoneNumber.trim();

  // Must match: +84 followed by exactly 9 digits
  const vietnamesePhoneRegex = /^\+84\d{9}$/;

  return vietnamesePhoneRegex.test(trimmedPhone);
}

/**
 * Normalizes and validates a Vietnamese phone number
 * Trims whitespace and validates format
 *
 * @param phoneNumber - The phone number to normalize
 * @returns Trimmed phone number if valid, null if invalid
 */
export function normalizeVietnamesePhone(phoneNumber: string | null | undefined): string | null {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return null;
  }

  const trimmedPhone = phoneNumber.trim();

  if (isValidVietnamesePhone(trimmedPhone)) {
    return trimmedPhone;
  }

  return null;
}

/**
 * Phone number validation and formatting utilities for Vietnamese phone numbers
 */

/**
 * Validates Vietnamese phone number format
 * Accepted formats:
 * - 0XXXXXXXXX (10 digits starting with 0, valid prefixes: 03, 05, 07, 08, 09)
 * - +84XXXXXXXXX (12 chars starting with +84)
 *
 * @param phone - Phone number string to validate
 * @returns true if valid, false otherwise
 */
export function isValidPhone(phone: string): boolean {
  if (!phone) return false;

  // Remove all spaces for validation
  const cleanPhone = phone.replace(/\s/g, '');

  // Format 1: 0XXXXXXXXX (10 digits)
  const format1Regex = /^0(3|5|7|8|9)\d{8}$/;

  // Format 2: +84XXXXXXXXX (12 characters)
  const format2Regex = /^\+84(3|5|7|8|9)\d{8}$/;

  return format1Regex.test(cleanPhone) || format2Regex.test(cleanPhone);
}

/**
 * Formats phone number for display
 * Converts: 0912590370 or +84912590370 → (+84) 912 590 370
 *
 * @param phone - Phone number string to format
 * @returns Formatted phone number or original if invalid
 */
export function formatPhoneForDisplay(phone: string): string {
  if (!phone) return '';

  // Remove all spaces
  const cleanPhone = phone.replace(/\s/g, '');

  // Normalize to +84 format first
  const normalized = normalizePhone(cleanPhone);

  if (!normalized) return phone;

  // Extract parts: +84 912 590 370
  // +84 followed by 9 digits split as: XXX XXX XXX
  const match = normalized.match(/^\+84(\d{3})(\d{3})(\d{3})$/);

  if (match) {
    return `(+84) ${match[1]} ${match[2]} ${match[3]}`;
  }

  return phone;
}

/**
 * Normalizes phone number to +84XXXXXXXXX format for API calls
 * Converts both formats to: +84XXXXXXXXX
 *
 * @param phone - Phone number string to normalize
 * @returns Normalized phone number or null if invalid
 */
export function normalizePhone(phone: string): string | null {
  if (!phone) return null;

  // Remove all spaces
  const cleanPhone = phone.replace(/\s/g, '');

  // If already in +84 format
  if (cleanPhone.startsWith('+84')) {
    return isValidPhone(cleanPhone) ? cleanPhone : null;
  }

  // If in 0XXX format, convert to +84
  if (cleanPhone.startsWith('0')) {
    const withoutZero = cleanPhone.substring(1);
    const normalized = `+84${withoutZero}`;
    return isValidPhone(normalized) ? normalized : null;
  }

  return null;
}

/**
 * Gets phone number validation error message
 *
 * @param phone - Phone number string to check
 * @returns Error message or null if valid
 */
export function getPhoneErrorMessage(phone: string): string | null {
  if (!phone) return null;
  if (!isValidPhone(phone)) {
    return 'Số điện thoại không hợp lệ';
  }
  return null;
}

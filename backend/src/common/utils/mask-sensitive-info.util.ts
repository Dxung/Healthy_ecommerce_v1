/**
 * Masks an email address to protect privacy
 * Example: dx*******@gmail.com (shows first 2 characters before @, masks the rest)
 * @param email - The email address to mask
 * @returns Masked email address, or null if input is null
 */
export function maskEmail(email: string | null): string | null {
  if (!email) {
    return null;
  }

  const [localPart, domain] = email.split('@');

  if (!localPart || !domain) {
    // Invalid email format, return as is or masked completely
    return email;
  }

  // Show first 2 characters of local part, mask the rest
  const visibleChars = Math.min(2, localPart.length);
  const maskedLocalPart =
    localPart.substring(0, visibleChars) +
    '*'.repeat(Math.max(0, localPart.length - visibleChars));

  return `${maskedLocalPart}@${domain}`;
}

/**
 * Masks a phone number to protect privacy
 * Example: +84*******88 (keeps +84 country code, shows only last 2 digits)
 * System only accepts +84 phone numbers
 * @param phoneNumber - The phone number to mask (format: +84XXXXXXXXX)
 * @returns Masked phone number, or null if input is null
 */
export function maskPhoneNumber(phoneNumber: string | null): string | null {
  if (!phoneNumber) {
    return null;
  }

  // Check if phone starts with +84 country code
  if (phoneNumber.startsWith('+84')) {
    const remainingDigits = phoneNumber.substring(3); // Remove '+84'

    // Show only last 2 digits of the remaining part
    const visibleDigits = 2;
    const maskedLength = Math.max(0, remainingDigits.length - visibleDigits);

    return (
      '+84' + '*'.repeat(maskedLength) + remainingDigits.slice(-visibleDigits)
    );
  }

  // Fallback: show only last 2 digits (for edge cases without country code)
  const visibleDigits = 2;
  const maskedLength = Math.max(0, phoneNumber.length - visibleDigits);

  return '*'.repeat(maskedLength) + phoneNumber.slice(-visibleDigits);
}

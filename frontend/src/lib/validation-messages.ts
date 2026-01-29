/**
 * Maps backend validation error codes to Vietnamese error messages
 */
export const VALIDATION_MESSAGES: Record<string, string> = {
  // Username errors
  'Username invalid format.': 'Tên đăng nhập không hợp lệ.',
  'Username exceeds maximum length.': 'Tên đăng nhập không được quá 255 ký tự.',

  // Password errors
  'Password is too weak.':
    'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.',
  'Password exceeds maximum length.': 'Mật khẩu không được quá 128 ký tự.',
  'Password must be at least 8 characters.': 'Mật khẩu phải có ít nhất 8 ký tự.',

  // Login ID errors
  'Login ID exceeds maximum length.':
    'Email/Số điện thoại/Tên đăng nhập không được quá 255 ký tự.',

  // Token errors
  'External token is required.': 'Mã xác thực bắt buộc.',
  'External token must be a string.': 'Mã xác thực không hợp lệ.',
  'Reset token is required.': 'Mã đặt lại mật khẩu bắt buộc.',
  'Reset token must be a string.': 'Mã đặt lại mật khẩu không hợp lệ.',
  'New password is required.': 'Mật khẩu mới bắt buộc.',
  'New password must be a string.': 'Mật khẩu mới không hợp lệ.',

  // Generic validation
  'Validation failed': 'Thông tin không hợp lệ. Vui lòng kiểm tra lại.',
};

/**
 * Converts validation error messages to Vietnamese
 */
export function translateValidationError(error: string): string {
  return VALIDATION_MESSAGES[error] || error;
}

/**
 * Formats validation errors from backend into a single Vietnamese message
 */
export function formatValidationErrors(details: Array<{ field: string; errors: string[] }>): string {
  const messages: string[] = [];

  details.forEach(({ field, errors }) => {
    errors.forEach(error => {
      const translated = translateValidationError(error);
      messages.push(translated);
    });
  });

  return messages.join(' ');
}

/**
 * Error codes specific to image processing operations
 */
export const IMAGE_PROCESSING_ERRORS = {
  // File validation errors
  FILE_TOO_LARGE: {
    code: 'IMAGE_FILE_TOO_LARGE',
    message: 'Kích thước ảnh không được vượt quá 2MB',
  },
  INVALID_FILE_TYPE: {
    code: 'IMAGE_INVALID_FILE_TYPE',
    message: 'Định dạng ảnh không hợp lệ. Chỉ chấp nhận JPG, PNG, WEBP',
  },
  INVALID_FILE: {
    code: 'IMAGE_INVALID_FILE',
    message: 'Tệp không hợp lệ',
  },

  // Processing errors
  PROCESSING_FAILED: {
    code: 'IMAGE_PROCESSING_FAILED',
    message: 'Xử lý ảnh thất bại. Vui lòng thử lại sau',
  },

  // Upload errors
  UPLOAD_FAILED: {
    code: 'IMAGE_UPLOAD_FAILED',
    message: 'Tải ảnh lên thất bại. Vui lòng thử lại sau',
  },
  DELETE_FAILED: {
    code: 'IMAGE_DELETE_FAILED',
    message: 'Xóa ảnh thất bại. Vui lòng thử lại sau',
  },

  // Configuration errors
  CONFIGURATION_ERROR: {
    code: 'IMAGE_CONFIGURATION_ERROR',
    message: 'Lỗi cấu hình dịch vụ ảnh',
  },
} as const satisfies Record<string, { code: string; message: string }>;

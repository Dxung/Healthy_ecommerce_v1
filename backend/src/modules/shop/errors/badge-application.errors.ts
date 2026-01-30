/**
 * Collection for Badge Application module error definitions.
 * Provides standardized error codes and messages for badge application-related errors.
 */
export const BADGE_APPLICATION_ERRORS = {
  // ======================== APPLICATION ERRORS ========================

  APPLICATION_NOT_FOUND: {
    code: 'BADGE_APP_NOT_FOUND',
    message: 'Không tìm thấy đơn đăng ký badge.',
  },
  NOT_YOUR_APPLICATION: {
    code: 'BADGE_APP_NOT_YOUR_APPLICATION',
    message: 'Đơn đăng ký này không thuộc về cửa hàng của bạn.',
  },
  ALREADY_HAS_PENDING_APPLICATION: {
    code: 'BADGE_APP_ALREADY_HAS_PENDING',
    message: 'Bạn đã có đơn đăng ký đang chờ xử lý.',
  },
  CANNOT_APPROVE_NON_PENDING: {
    code: 'BADGE_APP_CANNOT_APPROVE_NON_PENDING',
    message: 'Chỉ có thể duyệt đơn đang ở trạng thái chờ xử lý.',
  },
  CANNOT_REJECT_NON_PENDING: {
    code: 'BADGE_APP_CANNOT_REJECT_NON_PENDING',
    message: 'Chỉ có thể từ chối đơn đang ở trạng thái chờ xử lý.',
  },
  CANNOT_CANCEL_NON_PENDING: {
    code: 'BADGE_APP_CANNOT_CANCEL_NON_PENDING',
    message: 'Chỉ có thể hủy đơn đang ở trạng thái chờ xử lý.',
  },

  // ======================== DOCUMENT ERRORS ========================

  MISSING_REQUIRED_DOCUMENTS: {
    code: 'BADGE_APP_MISSING_REQUIRED_DOCUMENTS',
    message: 'Thiếu giấy tờ bắt buộc để đăng ký badge.',
  },
  DOCUMENT_EXPIRED: {
    code: 'BADGE_APP_DOCUMENT_EXPIRED',
    message: 'Giấy tờ đã hết hạn.',
  },

  // ======================== OFFICIAL BRAND ERRORS ========================

  ALREADY_OFFICIAL_FOR_BRAND: {
    code: 'BADGE_APP_ALREADY_OFFICIAL_FOR_BRAND',
    message: 'Cửa hàng đã là đại lý chính hãng của thương hiệu này.',
  },
  ALREADY_REVOKED: {
    code: 'BADGE_APP_ALREADY_REVOKED',
    message: 'Trạng thái đại lý chính hãng đã bị thu hồi trước đó.',
  },
  BRAND_NOT_FOUND: {
    code: 'BADGE_APP_BRAND_NOT_FOUND',
    message: 'Không tìm thấy thương hiệu.',
  },
  NO_REQUIREMENTS_FOR_BRAND: {
    code: 'BADGE_APP_NO_REQUIREMENTS_FOR_BRAND',
    message: 'Thương hiệu chưa có yêu cầu giấy tờ. Vui lòng liên hệ admin.',
  },

  // ======================== VERIFIED BADGE ERRORS ========================

  ALREADY_HAS_VERIFIED_BADGE: {
    code: 'BADGE_APP_ALREADY_HAS_VERIFIED',
    message: 'Cửa hàng đã có badge Xác thực.',
  },

  // ======================== REQUIREMENT ERRORS ========================

  REQUIREMENT_NOT_FOUND: {
    code: 'BADGE_APP_REQUIREMENT_NOT_FOUND',
    message: 'Không tìm thấy yêu cầu giấy tờ.',
  },
  REQUIREMENT_ALREADY_EXISTS: {
    code: 'BADGE_APP_REQUIREMENT_ALREADY_EXISTS',
    message: 'Yêu cầu giấy tờ này đã tồn tại cho thương hiệu.',
  },
} as const satisfies Record<string, { code: string; message: string }>;

/**
 * Collection for Shop module error definitions.
 * Provides standardized error codes and messages for shop-related errors.
 */
export const SHOP_ERRORS = {
  REGISTRATION_NOT_FOUND: {
    code: 'SHOP_REGISTRATION_NOT_FOUND',
    message: 'Không tìm thấy yêu cầu đăng ký cửa hàng.',
  },
  ALREADY_HAS_PENDING_REQUEST: {
    code: 'SHOP_ALREADY_HAS_PENDING_REQUEST',
    message: 'Bạn đã có yêu cầu đăng ký cửa hàng đang chờ xử lý.',
  },
  ALREADY_HAS_SHOP: {
    code: 'SHOP_ALREADY_HAS_SHOP',
    message: 'Bạn đã sở hữu một cửa hàng.',
  },
  REGISTRATION_ALREADY_PROCESSED: {
    code: 'SHOP_REGISTRATION_ALREADY_PROCESSED',
    message: 'Yêu cầu đăng ký này đã được xử lý.',
  },
  SLUG_ALREADY_EXISTS: {
    code: 'SHOP_SLUG_ALREADY_EXISTS',
    message: 'Tên cửa hàng đã được sử dụng. Vui lòng chọn tên khác.',
  },
  SHOP_NAME_ALREADY_EXISTS: {
    code: 'SHOP_NAME_ALREADY_EXISTS',
    message: 'Tên cửa hàng đã được sử dụng. Vui lòng chọn tên khác.',
  },
  MISSING_REQUIRED_DOCUMENTS: {
    code: 'SHOP_MISSING_REQUIRED_DOCUMENTS',
    message: 'Thiếu tài liệu bắt buộc để đăng ký.',
  },
  INVALID_BRAND_FOR_OFFICIAL_BADGE: {
    code: 'SHOP_INVALID_BRAND_FOR_OFFICIAL_BADGE',
    message: 'Thương hiệu không hợp lệ để đăng ký badge chính hãng.',
  },
  MISSING_BRAND_DOCUMENTS: {
    code: 'SHOP_MISSING_BRAND_DOCUMENTS',
    message: 'Thiếu tài liệu thương hiệu để đăng ký badge chính hãng.',
  },
  INVALID_REGISTRATION_TOKEN: {
    code: 'SHOP_INVALID_REGISTRATION_TOKEN',
    message: 'Mã xác thực đăng ký không hợp lệ hoặc đã hết hạn.',
  },
  USER_ALREADY_HAS_PHONE: {
    code: 'SHOP_USER_ALREADY_HAS_PHONE',
    message: 'Bạn đã có số điện thoại. Không cần xác thực OTP.',
  },
  PHONE_VERIFICATION_REQUIRED: {
    code: 'SHOP_PHONE_VERIFICATION_REQUIRED',
    message: 'Bạn chưa có số điện thoại. Vui lòng xác thực OTP trước.',
  },
  PHONE_MISMATCH_WITH_ACCOUNT: {
    code: 'SHOP_PHONE_MISMATCH_WITH_ACCOUNT',
    message: 'Số điện thoại không khớp với tài khoản của bạn.',
  },

  // ======================== SHOP ERRORS ========================

  SHOP_NOT_FOUND: {
    code: 'SHOP_NOT_FOUND',
    message: 'Không tìm thấy cửa hàng.',
  },
  CANNOT_DEACTIVATE: {
    code: 'SHOP_CANNOT_DEACTIVATE',
    message: 'Không thể tạm ngưng cửa hàng ở trạng thái hiện tại.',
  },
  CANNOT_ACTIVATE: {
    code: 'SHOP_CANNOT_ACTIVATE',
    message: 'Không thể kích hoạt cửa hàng ở trạng thái hiện tại.',
  },
  CANNOT_SUSPEND: {
    code: 'SHOP_CANNOT_SUSPEND',
    message: 'Không thể đình chỉ cửa hàng ở trạng thái hiện tại.',
  },
  CANNOT_UNSUSPEND: {
    code: 'SHOP_CANNOT_UNSUSPEND',
    message: 'Không thể bỏ đình chỉ cửa hàng ở trạng thái hiện tại.',
  },
  ALREADY_BANNED: {
    code: 'SHOP_ALREADY_BANNED',
    message: 'Cửa hàng đã bị cấm vĩnh viễn.',
  },

  // ======================== BADGE ERRORS ========================

  BADGE_NOT_FOUND: {
    code: 'SHOP_BADGE_NOT_FOUND',
    message: 'Không tìm thấy badge.',
  },
  BADGE_ALREADY_DISABLED: {
    code: 'SHOP_BADGE_ALREADY_DISABLED',
    message: 'Badge đã bị vô hiệu hóa trước đó.',
  },
  BADGE_ALREADY_ACTIVE: {
    code: 'SHOP_BADGE_ALREADY_ACTIVE',
    message: 'Badge đã được kích hoạt.',
  },
  BADGE_ALREADY_EXISTS: {
    code: 'SHOP_BADGE_ALREADY_EXISTS',
    message: 'Cửa hàng đã có badge này.',
  },

  // ======================== DOCUMENT TYPE ERRORS ========================

  DOCUMENT_TYPE_NOT_FOUND: {
    code: 'SHOP_DOCUMENT_TYPE_NOT_FOUND',
    message: 'Không tìm thấy loại tài liệu.',
  },

  // ======================== REQUIREMENT ERRORS ========================

  REQUIREMENT_NOT_FOUND: {
    code: 'SHOP_REQUIREMENT_NOT_FOUND',
    message: 'Không tìm thấy yêu cầu badge.',
  },
} as const satisfies Record<string, { code: string; message: string }>;

/**
 * Collection for User module error definitions.
 * Provide standardized error codes and messages for user-related errors.
 */
export const USER_ERRORS = {
  USERNAME_ALREADY_EXISTS: {
    code: 'USER_USERNAME_ALREADY_EXISTS',
    message: 'Username already exists. Please choose a different username.',
  },
  DATE_OF_BIRTH_ALREADY_CHANGED: {
    code: 'USER_DATE_OF_BIRTH_ALREADY_CHANGED',
    message:
      'The date of birth has already been changed once and cannot be changed again.',
  },
  GENDER_ALREADY_CHANGED: {
    code: 'GENDER_ALREADY_CHANGED',
    message:
      'The gender has already been changed once and cannot be changed again.',
  },
  PHONE_NOT_CORRECT: {
    code: 'USER_PHONE_NOT_CORRECT',
    message:
      'Phone number format is invalid. Only Vietnamese phone numbers (+84XXXXXXXXX) are supported.',
  },
  PHONE_ALREADY_IN_USE: {
    code: 'USER_PHONE_ALREADY_IN_USE',
    message: 'Số điện thoại này đã được sử dụng bởi tài khoản khác.',
  },
  EMAIL_ALREADY_IN_USE: {
    code: 'USER_EMAIL_ALREADY_IN_USE',
    message: 'Email này đã được sử dụng bởi tài khoản khác.',
  },
  ADDRESS_NOT_FOUND: {
    code: 'USER_ADDRESS_NOT_FOUND',
    message: 'Địa chỉ không tồn tại.',
  },
  ADDRESS_NOT_OWNED_BY_USER: {
    code: 'USER_ADDRESS_NOT_OWNED_BY_USER',
    message: 'Bạn không có quyền truy cập địa chỉ này.',
  },
  INVALID_LOCATION_HIERARCHY: {
    code: 'USER_INVALID_LOCATION_HIERARCHY',
    message:
      'Thông tin địa chỉ không hợp lệ. Phường/Xã không thuộc Quận/Huyện hoặc Tỉnh/Thành phố đã chọn.',
  },
  CANNOT_DELETE_DEFAULT_ADDRESS: {
    code: 'USER_CANNOT_DELETE_DEFAULT_ADDRESS',
    message:
      'Không thể xóa địa chỉ mặc định khi còn địa chỉ khác. Hãy đặt địa chỉ khác làm mặc định trước.',
  },
  MAX_ADDRESSES_REACHED: {
    code: 'USER_MAX_ADDRESSES_REACHED',
    message: 'Bạn đã đạt giới hạn tối đa 10 địa chỉ. Vui lòng xóa địa chỉ cũ trước khi thêm mới.',
  },
  AVATAR_UPLOAD_FAILED: {
    code: 'USER_AVATAR_UPLOAD_FAILED',
    message: 'Tải ảnh đại diện lên thất bại. Vui lòng thử lại sau.',
  },
  AVATAR_DELETE_FAILED: {
    code: 'USER_AVATAR_DELETE_FAILED',
    message: 'Xóa ảnh đại diện thất bại. Vui lòng thử lại sau.',
  },
  NO_FILE_UPLOADED: {
    code: 'USER_NO_FILE_UPLOADED',
    message: 'Không có tệp nào được tải lên.',
  },
  USER_NOT_FOUND: {
    code: 'USER_NOT_FOUND',
    message: 'Người dùng không tồn tại.',
  },
  USER_ALREADY_SUSPENDED: {
    code: 'USER_ALREADY_SUSPENDED',
    message: 'Tài khoản người dùng đã bị khóa.',
  },
  USER_ALREADY_ACTIVE: {
    code: 'USER_ALREADY_ACTIVE',
    message: 'Tài khoản người dùng đã hoạt động.',
  },
  CANNOT_MODIFY_OWN_ACCOUNT: {
    code: 'USER_CANNOT_MODIFY_OWN_ACCOUNT',
    message: 'Bạn không thể thực hiện hành động này trên tài khoản của chính mình.',
  },
  CANNOT_MODIFY_SUPER_ADMIN: {
    code: 'USER_CANNOT_MODIFY_SUPER_ADMIN',
    message: 'Không thể thực hiện hành động này trên tài khoản Super Admin.',
  },
} as const satisfies Record<string, { code: string; message: string }>;

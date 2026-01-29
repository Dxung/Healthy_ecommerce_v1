/**
 * Collection for Location module error definitions.
 * Provide standardized error codes and messages for location-related errors.
 */
export const LOCATION_ERRORS = {
  PROVINCE_NOT_FOUND: {
    code: 'LOCATION_PROVINCE_NOT_FOUND',
    message: 'Tỉnh/Thành phố không tồn tại.',
  },
  DISTRICT_NOT_FOUND: {
    code: 'LOCATION_DISTRICT_NOT_FOUND',
    message: 'Quận/Huyện không tồn tại.',
  },
  WARD_NOT_FOUND: {
    code: 'LOCATION_WARD_NOT_FOUND',
    message: 'Phường/Xã không tồn tại.',
  },
  LOCATION_HIERARCHY_INVALID: {
    code: 'LOCATION_HIERARCHY_INVALID',
    message:
      'Thông tin địa chỉ không hợp lệ. Phường/Xã không thuộc Quận/Huyện hoặc Tỉnh/Thành phố đã chọn.',
  },
  LOCATION_DATA_NOT_AVAILABLE: {
    code: 'LOCATION_DATA_NOT_AVAILABLE',
    message: 'Dữ liệu địa chỉ chưa được cài đặt trong hệ thống.',
  },
} as const satisfies Record<string, { code: string; message: string }>;

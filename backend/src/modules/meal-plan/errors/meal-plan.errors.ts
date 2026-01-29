/**
 * Collection for MealPlan module error definitions.
 * Provide standardized error codes and messages for meal-plan-related errors.
 */
export const MEAL_PLAN_ERRORS = {
  HEALTH_PROFILE_NOT_FOUND: {
    code: 'MEAL_PLAN_HEALTH_PROFILE_NOT_FOUND',
    message: 'Không tìm thấy hồ sơ sức khỏe.',
  },
  PRESET_NOT_FOUND: {
    code: 'MEAL_PLAN_PRESET_NOT_FOUND',
    message: 'Không tìm thấy thực đơn mẫu.',
  },
  PRESET_NOT_OWNED: {
    code: 'MEAL_PLAN_PRESET_NOT_OWNED',
    message: 'Bạn không có quyền chỉnh sửa thực đơn này.',
  },
  MEAL_LOG_NOT_FOUND: {
    code: 'MEAL_PLAN_MEAL_LOG_NOT_FOUND',
    message: 'Không tìm thấy nhật ký bữa ăn.',
  },
  MEAL_LOG_NOT_OWNED: {
    code: 'MEAL_PLAN_MEAL_LOG_NOT_OWNED',
    message: 'Bạn không có quyền chỉnh sửa nhật ký này.',
  },
  EXERCISE_LOG_NOT_FOUND: {
    code: 'MEAL_PLAN_EXERCISE_LOG_NOT_FOUND',
    message: 'Không tìm thấy nhật ký tập luyện.',
  },
  EXERCISE_LOG_NOT_OWNED: {
    code: 'MEAL_PLAN_EXERCISE_LOG_NOT_OWNED',
    message: 'Bạn không có quyền chỉnh sửa nhật ký này.',
  },
  PRODUCT_NOT_FOUND: {
    code: 'MEAL_PLAN_PRODUCT_NOT_FOUND',
    message: 'Không tìm thấy sản phẩm.',
  },
  PRODUCT_NO_NUTRITION: {
    code: 'MEAL_PLAN_PRODUCT_NO_NUTRITION',
    message: 'Sản phẩm không có thông tin dinh dưỡng.',
  },
  CANNOT_FOLLOW_SELF: {
    code: 'MEAL_PLAN_CANNOT_FOLLOW_SELF',
    message: 'Bạn không thể theo dõi chính mình.',
  },
  USER_NOT_FOUND: {
    code: 'MEAL_PLAN_USER_NOT_FOUND',
    message: 'Không tìm thấy người dùng.',
  },
} as const satisfies Record<string, { code: string; message: string }>;

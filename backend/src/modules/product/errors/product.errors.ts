/**
 * Collection of Product module error definitions.
 * Provides standardized error codes and messages for product-related errors.
 */
export const PRODUCT_ERRORS = {
  // ======================== PRODUCT ERRORS ========================
  PRODUCT_NOT_FOUND: {
    code: 'PRODUCT_NOT_FOUND',
    message: 'Không tìm thấy sản phẩm.',
  },
  PRODUCT_SLUG_EXISTS: {
    code: 'PRODUCT_SLUG_EXISTS',
    message: 'Slug sản phẩm đã tồn tại trong cửa hàng này.',
  },
  PRODUCT_NOT_OWNED: {
    code: 'PRODUCT_NOT_OWNED',
    message: 'Bạn không có quyền truy cập sản phẩm này.',
  },
  PRODUCT_CANNOT_PUBLISH: {
    code: 'PRODUCT_CANNOT_PUBLISH',
    message: 'Không thể đăng bán sản phẩm. Cần có ít nhất 1 biến thể còn hàng.',
  },
  PRODUCT_CANNOT_EDIT: {
    code: 'PRODUCT_CANNOT_EDIT',
    message: 'Không thể chỉnh sửa sản phẩm ở trạng thái hiện tại.',
  },
  PRODUCT_ALREADY_ACTIVE: {
    code: 'PRODUCT_ALREADY_ACTIVE',
    message: 'Sản phẩm đã đang hoạt động.',
  },
  PRODUCT_ALREADY_DRAFT: {
    code: 'PRODUCT_ALREADY_DRAFT',
    message: 'Sản phẩm đã ở trạng thái nháp.',
  },
  PRODUCT_SUSPENDED: {
    code: 'PRODUCT_SUSPENDED',
    message: 'Sản phẩm đã bị tạm ngưng bởi quản trị viên.',
  },
  PRODUCT_ALREADY_INACTIVE: {
    code: 'PRODUCT_ALREADY_INACTIVE',
    message: 'Sản phẩm đã ở trạng thái tạm dừng.',
  },
  PRODUCT_CANNOT_DEACTIVATE: {
    code: 'PRODUCT_CANNOT_DEACTIVATE',
    message: 'Chỉ có thể tạm dừng sản phẩm đang hoạt động.',
  },
  PRODUCT_CANNOT_ACTIVATE: {
    code: 'PRODUCT_CANNOT_ACTIVATE',
    message: 'Chỉ có thể kích hoạt lại sản phẩm đang tạm dừng.',
  },
  PRODUCT_CANNOT_HARD_DELETE: {
    code: 'PRODUCT_CANNOT_HARD_DELETE',
    message: 'Chỉ có thể xóa vĩnh viễn sản phẩm nháp. Sản phẩm đã xuất bản chỉ có thể xóa mềm.',
  },

  // ======================== CATEGORY ERRORS ========================
  CATEGORY_NOT_FOUND: {
    code: 'CATEGORY_NOT_FOUND',
    message: 'Không tìm thấy danh mục.',
  },
  CATEGORY_SLUG_EXISTS: {
    code: 'CATEGORY_SLUG_EXISTS',
    message: 'Slug danh mục đã tồn tại.',
  },
  CATEGORY_HAS_PRODUCTS: {
    code: 'CATEGORY_HAS_PRODUCTS',
    message: 'Không thể xóa danh mục đang có sản phẩm.',
  },
  CATEGORY_HAS_CHILDREN: {
    code: 'CATEGORY_HAS_CHILDREN',
    message: 'Không thể xóa danh mục đang có danh mục con.',
  },
  CATEGORY_LEVEL_EXCEEDED: {
    code: 'CATEGORY_LEVEL_EXCEEDED',
    message: 'Danh mục chỉ hỗ trợ tối đa 3 cấp.',
  },
  CATEGORY_PARENT_NOT_FOUND: {
    code: 'CATEGORY_PARENT_NOT_FOUND',
    message: 'Không tìm thấy danh mục cha.',
  },

  // ======================== BRAND ERRORS ========================
  BRAND_NOT_FOUND: {
    code: 'BRAND_NOT_FOUND',
    message: 'Không tìm thấy thương hiệu.',
  },
  BRAND_SLUG_EXISTS: {
    code: 'BRAND_SLUG_EXISTS',
    message: 'Slug thương hiệu đã tồn tại.',
  },
  BRAND_HAS_PRODUCTS: {
    code: 'BRAND_HAS_PRODUCTS',
    message: 'Không thể xóa thương hiệu đang có sản phẩm.',
  },

  // ======================== IMAGE ERRORS ========================
  IMAGE_NOT_FOUND: {
    code: 'IMAGE_NOT_FOUND',
    message: 'Không tìm thấy ảnh sản phẩm.',
  },
  IMAGE_LIMIT_EXCEEDED: {
    code: 'IMAGE_LIMIT_EXCEEDED',
    message: 'Số lượng ảnh sản phẩm đã đạt giới hạn tối đa (5 ảnh).',
  },
  IMAGE_UPLOAD_FAILED: {
    code: 'IMAGE_UPLOAD_FAILED',
    message: 'Tải ảnh lên thất bại. Vui lòng thử lại.',
  },

  // ======================== VARIANT ERRORS ========================
  VARIANT_NOT_FOUND: {
    code: 'VARIANT_NOT_FOUND',
    message: 'Không tìm thấy biến thể sản phẩm.',
  },
  VARIANT_INSUFFICIENT_STOCK: {
    code: 'VARIANT_INSUFFICIENT_STOCK',
    message: 'Số lượng tồn kho không đủ.',
  },
  VARIANT_INVALID_PRICE: {
    code: 'VARIANT_INVALID_PRICE',
    message: 'Giá sản phẩm không hợp lệ.',
  },
  VARIANT_LAST_CANNOT_DELETE: {
    code: 'VARIANT_LAST_CANNOT_DELETE',
    message: 'Không thể xóa biến thể cuối cùng của sản phẩm.',
  },
  VARIANT_SKU_EXISTS: {
    code: 'VARIANT_SKU_EXISTS',
    message: 'Mã SKU đã tồn tại.',
  },

  // ======================== OPTION ERRORS ========================
  OPTION_NOT_FOUND: {
    code: 'OPTION_NOT_FOUND',
    message: 'Không tìm thấy tùy chọn sản phẩm.',
  },
  OPTION_VALUE_NOT_FOUND: {
    code: 'OPTION_VALUE_NOT_FOUND',
    message: 'Không tìm thấy giá trị tùy chọn.',
  },

  // ======================== SHOP ERRORS ========================
  SHOP_NOT_FOUND: {
    code: 'SHOP_NOT_FOUND',
    message: 'Không tìm thấy cửa hàng.',
  },
  USER_HAS_NO_SHOP: {
    code: 'USER_HAS_NO_SHOP',
    message: 'Bạn chưa có cửa hàng. Vui lòng đăng ký cửa hàng trước.',
  },
  PRODUCT_SLOT_LIMIT_REACHED: {
    code: 'PRODUCT_SLOT_LIMIT_REACHED',
    message: 'Đã đạt giới hạn số lượng sản phẩm cho phép của cửa hàng.',
  },
  OFFICIAL_SHOP_BRAND_REQUIRED: {
    code: 'OFFICIAL_SHOP_BRAND_REQUIRED',
    message: 'Shop chính hãng phải chọn thương hiệu đã đăng ký khi tạo sản phẩm.',
  },
  OFFICIAL_SHOP_UNAUTHORIZED_BRAND: {
    code: 'OFFICIAL_SHOP_UNAUTHORIZED_BRAND',
    message: 'Shop chính hãng chỉ có thể tạo sản phẩm cho thương hiệu đã đăng ký.',
  },
  OFFICIAL_SHOP_CANNOT_SHOW_NON_OFFICIAL_PRODUCT: {
    code: 'OFFICIAL_SHOP_CANNOT_SHOW_NON_OFFICIAL_PRODUCT',
    message: 'Shop chính hãng không thể hiện sản phẩm của thương hiệu chưa đăng ký chính hãng.',
  },

  // ======================== ALLERGEN TAG ERRORS ========================
  ALLERGEN_TAG_NOT_FOUND: {
    code: 'ALLERGEN_TAG_NOT_FOUND',
    message: 'Không tìm thấy nhãn dị ứng.',
  },
  ALLERGEN_TAG_SLUG_EXISTS: {
    code: 'ALLERGEN_TAG_SLUG_EXISTS',
    message: 'Slug nhãn dị ứng đã tồn tại.',
  },
  ALLERGEN_TAG_IN_USE: {
    code: 'ALLERGEN_TAG_IN_USE',
    message: 'Không thể xóa nhãn dị ứng đang được sử dụng.',
  },

  // ======================== DIET TAG ERRORS ========================
  DIET_TAG_NOT_FOUND: {
    code: 'DIET_TAG_NOT_FOUND',
    message: 'Không tìm thấy nhãn chế độ ăn.',
  },
  DIET_TAG_SLUG_EXISTS: {
    code: 'DIET_TAG_SLUG_EXISTS',
    message: 'Slug nhãn chế độ ăn đã tồn tại.',
  },
  DIET_TAG_IN_USE: {
    code: 'DIET_TAG_IN_USE',
    message: 'Không thể xóa nhãn chế độ ăn đang được sử dụng.',
  },

  // ======================== UNIT ERRORS ========================
  UNIT_NOT_FOUND: {
    code: 'UNIT_NOT_FOUND',
    message: 'Không tìm thấy đơn vị.',
  },
  UNIT_SYMBOL_EXISTS: {
    code: 'UNIT_SYMBOL_EXISTS',
    message: 'Ký hiệu đơn vị đã tồn tại.',
  },
  UNIT_CONVERSION_NOT_FOUND: {
    code: 'UNIT_CONVERSION_NOT_FOUND',
    message: 'Không tìm thấy quy đổi đơn vị.',
  },
  UNIT_CONVERSION_EXISTS: {
    code: 'UNIT_CONVERSION_EXISTS',
    message: 'Quy đổi giữa hai đơn vị này đã tồn tại.',
  },
  UNIT_CONVERSION_SAME_UNIT: {
    code: 'UNIT_CONVERSION_SAME_UNIT',
    message: 'Không thể tạo quy đổi từ đơn vị đến chính nó.',
  },
  UNIT_CONVERSION_TYPE_MISMATCH: {
    code: 'UNIT_CONVERSION_TYPE_MISMATCH',
    message: 'Không thể quy đổi giữa các loại đơn vị khác nhau.',
  },
  UNIT_CONVERSION_NOT_AVAILABLE: {
    code: 'UNIT_CONVERSION_NOT_AVAILABLE',
    message: 'Không có quy đổi khả dụng giữa hai đơn vị này.',
  },
  UNIT_INVALID_SERVING_UNIT: {
    code: 'UNIT_INVALID_SERVING_UNIT',
    message: 'Đơn vị khẩu phần phải là đơn vị đo lường (g, kg, ml, L, ...).',
  },
  UNIT_INVALID_SELLING_UNIT: {
    code: 'UNIT_INVALID_SELLING_UNIT',
    message: 'Đơn vị bán hàng phải là đơn vị bán (Hộp, Gói, Chai, ...).',
  },
} as const satisfies Record<string, { code: string; message: string }>;

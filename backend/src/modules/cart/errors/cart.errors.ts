export const CART_ERRORS = {
  CART_NOT_FOUND: {
    code: 'CART_NOT_FOUND',
    message: 'Giỏ hàng không tồn tại.',
  },
  CART_ITEM_NOT_FOUND: {
    code: 'CART_ITEM_NOT_FOUND',
    message: 'Sản phẩm không tồn tại trong giỏ hàng.',
  },
  VARIANT_NOT_FOUND: {
    code: 'CART_VARIANT_NOT_FOUND',
    message: 'Biến thể sản phẩm không tồn tại.',
  },
  PRODUCT_NOT_FOUND: {
    code: 'CART_PRODUCT_NOT_FOUND',
    message: 'Sản phẩm không tồn tại.',
  },
  PRODUCT_NOT_AVAILABLE: {
    code: 'CART_PRODUCT_NOT_AVAILABLE',
    message: 'Sản phẩm hiện không khả dụng.',
  },
  VARIANT_NOT_ACTIVE: {
    code: 'CART_VARIANT_NOT_ACTIVE',
    message: 'Biến thể sản phẩm hiện không khả dụng.',
  },
  VARIANT_EXPIRED: {
    code: 'CART_VARIANT_EXPIRED',
    message: 'Sản phẩm đã hết hạn sử dụng.',
  },
  INSUFFICIENT_STOCK: {
    code: 'CART_INSUFFICIENT_STOCK',
    message: 'Số lượng sản phẩm trong kho không đủ.',
  },
  INVALID_QUANTITY: {
    code: 'CART_INVALID_QUANTITY',
    message: 'Số lượng sản phẩm không hợp lệ.',
  },
  CART_ITEM_NOT_OWNED: {
    code: 'CART_ITEM_NOT_OWNED',
    message: 'Bạn không có quyền thao tác với sản phẩm này trong giỏ hàng.',
  },
  CART_EMPTY: {
    code: 'CART_EMPTY',
    message: 'Giỏ hàng trống.',
  },
  NO_ITEMS_SELECTED: {
    code: 'CART_NO_ITEMS_SELECTED',
    message: 'Vui lòng chọn ít nhất một sản phẩm.',
  },
} as const satisfies Record<string, { code: string; message: string }>;

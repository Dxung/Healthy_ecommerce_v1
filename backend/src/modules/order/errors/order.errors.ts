export const ORDER_ERRORS = {
  ORDER_NOT_FOUND: {
    code: 'ORDER_NOT_FOUND',
    message: 'Đơn hàng không tồn tại.',
  },
  ORDER_NOT_OWNED: {
    code: 'ORDER_NOT_OWNED',
    message: 'Bạn không có quyền truy cập đơn hàng này.',
  },
  ORDER_NOT_CANCELLABLE: {
    code: 'ORDER_NOT_CANCELLABLE',
    message: 'Đơn hàng không thể hủy ở trạng thái hiện tại.',
  },
  ORDER_INVALID_STATUS_TRANSITION: {
    code: 'ORDER_INVALID_STATUS_TRANSITION',
    message: 'Không thể chuyển sang trạng thái này.',
  },
  CART_EMPTY: {
    code: 'ORDER_CART_EMPTY',
    message: 'Giỏ hàng trống, không thể đặt hàng.',
  },
  NO_ITEMS_SELECTED: {
    code: 'ORDER_NO_ITEMS_SELECTED',
    message: 'Vui lòng chọn ít nhất một sản phẩm để đặt hàng.',
  },
  ADDRESS_NOT_FOUND: {
    code: 'ORDER_ADDRESS_NOT_FOUND',
    message: 'Địa chỉ giao hàng không tồn tại.',
  },
  ADDRESS_NOT_OWNED: {
    code: 'ORDER_ADDRESS_NOT_OWNED',
    message: 'Địa chỉ giao hàng không thuộc về bạn.',
  },
  PRODUCT_UNAVAILABLE: {
    code: 'ORDER_PRODUCT_UNAVAILABLE',
    message: 'Một số sản phẩm không còn khả dụng.',
  },
  INSUFFICIENT_STOCK: {
    code: 'ORDER_INSUFFICIENT_STOCK',
    message: 'Số lượng tồn kho không đủ cho một số sản phẩm.',
  },
  PRICE_CHANGED: {
    code: 'ORDER_PRICE_CHANGED',
    message: 'Giá một số sản phẩm đã thay đổi. Vui lòng kiểm tra lại giỏ hàng.',
  },
  SHOP_NOT_ACTIVE: {
    code: 'ORDER_SHOP_NOT_ACTIVE',
    message: 'Cửa hàng hiện không hoạt động.',
  },
  BUYER_CANNOT_CANCEL: {
    code: 'ORDER_BUYER_CANNOT_CANCEL',
    message: 'Bạn chỉ có thể hủy đơn hàng khi chưa được xác nhận.',
  },
  SHOP_CANNOT_CANCEL: {
    code: 'ORDER_SHOP_CANNOT_CANCEL',
    message: 'Bạn chỉ có thể hủy đơn hàng khi chưa giao hàng.',
  },
  CANNOT_CONFIRM_DELIVERY: {
    code: 'ORDER_CANNOT_CONFIRM_DELIVERY',
    message: 'Đơn hàng chưa được giao, không thể xác nhận nhận hàng.',
  },
  SHOP_NOT_FOUND: {
    code: 'ORDER_SHOP_NOT_FOUND',
    message: 'Cửa hàng không tồn tại.',
  },
  NO_SHOP_PERMISSION: {
    code: 'ORDER_NO_SHOP_PERMISSION',
    message: 'Bạn không có quyền quản lý đơn hàng của cửa hàng này.',
  },
  INSUFFICIENT_COINS: {
    code: 'ORDER_INSUFFICIENT_COINS',
    message: 'Số dư coin không đủ.',
  },
  PAYMENT_FAILED: {
    code: 'ORDER_PAYMENT_FAILED',
    message: 'Thanh toán thất bại. Vui lòng thử lại.',
  },
  INSUFFICIENT_WALLET_BALANCE: {
    code: 'ORDER_INSUFFICIENT_WALLET_BALANCE',
    message: 'Số dư ví không đủ để thanh toán đơn hàng.',
  },
  ORDER_ITEM_NOT_FOUND: {
    code: 'ORDER_ITEM_NOT_FOUND',
    message: 'Sản phẩm không tồn tại trong đơn hàng.',
  },
  ITEM_ALREADY_REFUNDED: {
    code: 'ORDER_ITEM_ALREADY_REFUNDED',
    message: 'Sản phẩm này đã được hoàn tiền.',
  },
} as const satisfies Record<string, { code: string; message: string }>;

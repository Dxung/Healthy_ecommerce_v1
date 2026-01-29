/**
 * Collection of Review module error definitions.
 * Provides standardized error codes and messages for review-related errors.
 */
export const REVIEW_ERRORS = {
  // ======================== REVIEW ERRORS ========================
  ORDER_ITEM_NOT_FOUND: {
    code: 'REVIEW_ORDER_ITEM_NOT_FOUND',
    message: 'Không tìm thấy sản phẩm trong đơn hàng.',
  },
  ORDER_NOT_COMPLETED: {
    code: 'REVIEW_ORDER_NOT_COMPLETED',
    message: 'Chỉ có thể đánh giá khi đơn hàng đã hoàn thành.',
  },
  ITEM_REFUNDED: {
    code: 'REVIEW_ITEM_REFUNDED',
    message: 'Không thể đánh giá sản phẩm đã được hoàn tiền.',
  },
  ALREADY_REVIEWED: {
    code: 'REVIEW_ALREADY_REVIEWED',
    message: 'Bạn đã đánh giá sản phẩm này.',
  },
  REVIEW_WINDOW_EXPIRED: {
    code: 'REVIEW_WINDOW_EXPIRED',
    message: 'Đã quá thời hạn đánh giá sản phẩm.',
  },
  REVIEW_NOT_FOUND: {
    code: 'REVIEW_NOT_FOUND',
    message: 'Không tìm thấy đánh giá.',
  },
  NOT_REVIEW_OWNER: {
    code: 'REVIEW_NOT_OWNER',
    message: 'Bạn không có quyền thao tác đánh giá này.',
  },
  INVALID_RATING: {
    code: 'REVIEW_INVALID_RATING',
    message: 'Đánh giá phải từ 1 đến 5 sao.',
  },
  REVIEW_CANNOT_MODIFY: {
    code: 'REVIEW_CANNOT_MODIFY',
    message: 'Không thể chỉnh sửa đánh giá ở trạng thái hiện tại.',
  },

  // ======================== SHOP REPLY ERRORS ========================
  REPLY_ALREADY_EXISTS: {
    code: 'REVIEW_REPLY_ALREADY_EXISTS',
    message: 'Bạn đã trả lời đánh giá này.',
  },
  NOT_SHOP_OWNER: {
    code: 'REVIEW_NOT_SHOP_OWNER',
    message: 'Bạn không có quyền trả lời đánh giá này.',
  },
  REPLY_NOT_FOUND: {
    code: 'REVIEW_REPLY_NOT_FOUND',
    message: 'Không tìm thấy phản hồi.',
  },

  // ======================== ORDER/PRODUCT ERRORS ========================
  ORDER_NOT_FOUND: {
    code: 'REVIEW_ORDER_NOT_FOUND',
    message: 'Không tìm thấy đơn hàng.',
  },
  NOT_ORDER_BUYER: {
    code: 'REVIEW_NOT_ORDER_BUYER',
    message: 'Bạn không phải là người mua đơn hàng này.',
  },
  PRODUCT_NOT_FOUND: {
    code: 'REVIEW_PRODUCT_NOT_FOUND',
    message: 'Không tìm thấy sản phẩm.',
  },
  SHOP_NOT_FOUND: {
    code: 'REVIEW_SHOP_NOT_FOUND',
    message: 'Không tìm thấy cửa hàng.',
  },
} as const satisfies Record<string, { code: string; message: string }>;

export const PAYMENT_ERRORS = {
  WALLET_NOT_FOUND: {
    code: 'PAYMENT_WALLET_NOT_FOUND',
    message: 'Ví điện tử không tồn tại.',
  },
  INSUFFICIENT_BALANCE: {
    code: 'PAYMENT_INSUFFICIENT_BALANCE',
    message: 'Số dư ví không đủ.',
  },
  INVALID_AMOUNT: {
    code: 'PAYMENT_INVALID_AMOUNT',
    message: 'Số tiền không hợp lệ.',
  },
  PAYMENT_EXPIRED: {
    code: 'PAYMENT_EXPIRED',
    message: 'Giao dịch đã hết hạn.',
  },
  PAYMENT_ALREADY_PROCESSED: {
    code: 'PAYMENT_ALREADY_PROCESSED',
    message: 'Giao dịch đã được xử lý.',
  },
  PAYMENT_NOT_FOUND: {
    code: 'PAYMENT_NOT_FOUND',
    message: 'Không tìm thấy giao dịch thanh toán.',
  },
  VNPAY_SIGNATURE_INVALID: {
    code: 'PAYMENT_VNPAY_SIGNATURE_INVALID',
    message: 'Chữ ký VNPay không hợp lệ.',
  },
  VNPAY_TRANSACTION_FAILED: {
    code: 'PAYMENT_VNPAY_TRANSACTION_FAILED',
    message: 'Thanh toán VNPay thất bại.',
  },
  VNPAY_CONFIG_ERROR: {
    code: 'PAYMENT_VNPAY_CONFIG_ERROR',
    message: 'Cấu hình VNPay không đầy đủ.',
  },
  ESCROW_NOT_FOUND: {
    code: 'PAYMENT_ESCROW_NOT_FOUND',
    message: 'Không tìm thấy ký quỹ.',
  },
  ESCROW_ALREADY_RELEASED: {
    code: 'PAYMENT_ESCROW_ALREADY_RELEASED',
    message: 'Ký quỹ đã được giải ngân hoặc hoàn trả.',
  },
  PENDING_RELEASE_NOT_FOUND: {
    code: 'PAYMENT_PENDING_RELEASE_NOT_FOUND',
    message: 'Không tìm thấy yêu cầu giải ngân.',
  },
  PENDING_RELEASE_NOT_FAILED: {
    code: 'PAYMENT_PENDING_RELEASE_NOT_FAILED',
    message: 'Chỉ có thể thử lại các yêu cầu giải ngân thất bại.',
  },
  TOPUP_MIN_AMOUNT: {
    code: 'PAYMENT_TOPUP_MIN_AMOUNT',
    message: 'Số tiền nạp tối thiểu là 10,000 VND.',
  },
  TOPUP_MAX_AMOUNT: {
    code: 'PAYMENT_TOPUP_MAX_AMOUNT',
    message: 'Số tiền nạp tối đa là 50,000,000 VND.',
  },
  TRANSACTION_NOT_FOUND: {
    code: 'PAYMENT_TRANSACTION_NOT_FOUND',
    message: 'Không tìm thấy giao dịch thanh toán.',
  },
  INVALID_TRANSACTION_TYPE: {
    code: 'PAYMENT_INVALID_TRANSACTION_TYPE',
    message: 'Loại giao dịch không hợp lệ.',
  },
} as const satisfies Record<string, { code: string; message: string }>;

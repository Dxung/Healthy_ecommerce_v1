export const BUYER_ERRORS = {
  COIN_WALLET_NOT_FOUND: {
    code: 'BUYER_COIN_WALLET_NOT_FOUND',
    message: 'Ví xu không tồn tại.',
  },
  INSUFFICIENT_COIN_BALANCE: {
    code: 'BUYER_INSUFFICIENT_COIN_BALANCE',
    message: 'Số dư xu không đủ.',
  },
  INVALID_COIN_AMOUNT: {
    code: 'BUYER_INVALID_COIN_AMOUNT',
    message: 'Số xu không hợp lệ.',
  },
} as const satisfies Record<string, { code: string; message: string }>;

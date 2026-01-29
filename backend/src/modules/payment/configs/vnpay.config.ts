import { registerAs } from '@nestjs/config';

export const vnpayConfig = registerAs('vnpay', () => ({
  tmnCode: process.env.VNPAY_TMN_CODE || '',
  hashSecret: process.env.VNPAY_HASH_SECRET || '',
  vnpayUrl:
    process.env.VNPAY_URL ||
    'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  returnUrl:
    process.env.VNPAY_RETURN_URL ||
    'http://localhost:3001/api/payments/vnpay/return',
  apiUrl:
    process.env.VNPAY_API_URL ||
    'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction',
}));

export type VnpayConfig = {
  tmnCode: string;
  hashSecret: string;
  vnpayUrl: string;
  returnUrl: string;
  apiUrl: string;
};

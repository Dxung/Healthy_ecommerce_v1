import type { ResultAsync } from 'neverthrow';
import type { DomainError } from 'src/shared/types/domain-error.type';
import type { PaymentType } from 'src/database/typeorm/entities/payment/enums/payment-type.enum';

export interface CreatePaymentUrlParams {
  orderId: string;
  amount: number;
  orderInfo: string;
  ipAddress: string;
  locale?: 'vn' | 'en';
  bankCode?: string;
  paymentType?: PaymentType;
  /** Pre-generated transaction reference - if provided, use this instead of generating a new one */
  txnRef?: string;
}

export interface CreatePaymentUrlResult {
  paymentUrl: string;
  txnRef: string;
}

export interface VnpayReturnQuery {
  vnp_TmnCode: string;
  vnp_Amount: string;
  vnp_BankCode: string;
  vnp_BankTranNo?: string;
  vnp_CardType?: string;
  vnp_PayDate?: string;
  vnp_OrderInfo: string;
  vnp_TransactionNo?: string;
  vnp_ResponseCode: string;
  vnp_TransactionStatus?: string;
  vnp_TxnRef: string;
  vnp_SecureHash: string;
  // Index signature for iteration with Object.entries
  [key: string]: string | undefined;
}

export interface VnpayVerifyResult {
  isValid: boolean;
  txnRef: string;
  amount: number;
  bankCode: string;
  responseCode: string;
  transactionNo: string | null;
  bankTranNo: string | null;
  payDate: string | null;
  isSuccess: boolean;
  message: string;
}

export interface IVnpayService {
  createPaymentUrl(
    params: CreatePaymentUrlParams,
  ): ResultAsync<CreatePaymentUrlResult, DomainError>;

  verifyReturnUrl(
    query: VnpayReturnQuery,
  ): ResultAsync<VnpayVerifyResult, DomainError>;

  verifyIpn(
    query: VnpayReturnQuery,
  ): ResultAsync<VnpayVerifyResult, DomainError>;
}

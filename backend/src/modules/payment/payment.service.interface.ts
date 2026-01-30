import type { ResultAsync } from 'neverthrow';
import type { DomainError } from 'src/shared/types/domain-error.type';
import type { VnpayReturnQuery } from './services/vnpay.service.interface';

/**
 * Result of creating a payment transaction for order
 */
export interface CreateOrderPaymentResult {
  paymentUrl: string;
  txnRef: string;
  transactionId: string;
}

/**
 * Result of VNPay return handling
 */
export interface VnpayReturnHandlerResult {
  isSuccess: boolean;
  type: 'topup' | 'order_payment';
  amount: number;
  /** Redirect path for frontend */
  redirectPath: string;
  /** Query params for redirect */
  redirectParams: Record<string, string>;
}

export interface IPaymentService {
  /**
   * Create payment transaction for order and generate VNPay URL
   * @param orderId - Order ID
   * @param amount - Payment amount
   * @param ipAddress - Client IP address
   * @param orderCreatedAt - Order creation time (for timeout validation)
   */
  createOrderPayment(
    orderId: string,
    amount: number,
    ipAddress: string,
    orderCreatedAt?: Date,
  ): ResultAsync<CreateOrderPaymentResult, DomainError>;

  /**
   * Handle VNPay return URL callback
   * Processes payment result, updates transaction, marks orders as paid
   */
  handleVnpayReturn(
    query: VnpayReturnQuery,
  ): ResultAsync<VnpayReturnHandlerResult, DomainError>;

  /**
   * Handle VNPay IPN callback
   * Server-to-server notification handling
   */
  handleVnpayIpn(query: VnpayReturnQuery): ResultAsync<
    {
      RspCode: string;
      Message: string;
    },
    DomainError
  >;
}

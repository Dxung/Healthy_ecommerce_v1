import type { ResultAsync } from 'neverthrow';
import type { DomainError } from 'src/shared/types/domain-error.type';
import type { PaymentTransaction } from '../models/payment-transaction.model';

export interface IPaymentTransactionRepository {
  /**
   * Create a new payment transaction
   */
  create(
    transaction: PaymentTransaction,
  ): ResultAsync<PaymentTransaction, DomainError>;

  /**
   * Find payment transaction by ID
   */
  findById(id: string): ResultAsync<PaymentTransaction | null, DomainError>;

  /**
   * Find payment transaction by VNPay transaction reference
   */
  findByTxnRef(
    txnRef: string,
  ): ResultAsync<PaymentTransaction | null, DomainError>;

  /**
   * Find payment transaction by order ID
   */
  findByOrderId(
    orderId: string,
  ): ResultAsync<PaymentTransaction | null, DomainError>;

  /**
   * Update payment transaction
   */
  update(
    transaction: PaymentTransaction,
  ): ResultAsync<PaymentTransaction, DomainError>;

  /**
   * Save payment transaction (alias for update)
   */
  save(
    transaction: PaymentTransaction,
  ): ResultAsync<PaymentTransaction, DomainError>;

  /**
   * Cancel expired pending payments (older than specified minutes)
   */
  cancelExpiredPayments(
    expiredMinutes: number,
  ): ResultAsync<number, DomainError>;
}

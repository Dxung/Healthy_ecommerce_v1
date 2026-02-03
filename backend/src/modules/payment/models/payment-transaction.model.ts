import { v7 as uuidv7 } from 'uuid';
import { PaymentStatus } from 'src/database/typeorm/entities/payment/enums/payment-status.enum';
import { PaymentType } from 'src/database/typeorm/entities/payment/enums/payment-type.enum';

/**
 * PaymentTransaction Domain Model
 * Represents a VNPay payment record.
 * Links to either Order (for order payment) or Topup (for wallet topup).
 */
export class PaymentTransaction {
  constructor(
    private readonly _id: string,
    private readonly _topupId: string | null,
    private readonly _orderId: string | null,
    private readonly _relatedOrderIds: string[], // All order IDs for multi-shop checkout
    private readonly _type: PaymentType,
    private readonly _amount: number,
    private _status: PaymentStatus,
    private readonly _vnpayTxnRef: string,
    private _vnpayTransactionNo: string | null,
    private _vnpayResponseCode: string | null,
    private _vnpayResponseMessage: string | null,
    private _vnpayBankCode: string | null,
    private _vnpayBankTranNo: string | null,
    private _vnpayPayDate: Date | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  /**
   * Generates a unique VNPay transaction reference
   */
  static generateTxnRef(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${timestamp}${random}`;
  }

  /**
   * Creates a new payment transaction for topup
   */
  static createForTopup(params: {
    topupId: string;
    amount: number;
    txnRef?: string;
  }): PaymentTransaction {
    const now = new Date();
    return new PaymentTransaction(
      uuidv7(),
      params.topupId,
      null,
      [], // No related orders for topup
      PaymentType.TOPUP,
      params.amount,
      PaymentStatus.PENDING,
      params.txnRef ?? PaymentTransaction.generateTxnRef(),
      null,
      null,
      null,
      null,
      null,
      null,
      now,
      now,
    );
  }

  /**
   * Creates a new payment transaction for order payment
   * @param orderId - Primary order ID (for backward compatibility and indexing)
   * @param orderIds - All order IDs (for multi-shop checkout)
   * @param amount - Total payment amount
   */
  static createForOrder(params: {
    orderId: string;
    orderIds?: string[];
    amount: number;
  }): PaymentTransaction {
    const now = new Date();
    const allOrderIds = params.orderIds ?? [params.orderId];
    return new PaymentTransaction(
      uuidv7(),
      null,
      params.orderId,
      allOrderIds,
      PaymentType.ORDER_PAYMENT,
      params.amount,
      PaymentStatus.PENDING,
      PaymentTransaction.generateTxnRef(),
      null,
      null,
      null,
      null,
      null,
      null,
      now,
      now,
    );
  }

  /**
   * Marks the transaction as successful
   */
  markSuccess(vnpayData: {
    transactionNo: string;
    responseCode: string;
    responseMessage?: string;
    bankCode?: string;
    bankTranNo?: string;
    payDate?: Date;
  }): void {
    this._status = PaymentStatus.SUCCESS;
    this._vnpayTransactionNo = vnpayData.transactionNo;
    this._vnpayResponseCode = vnpayData.responseCode;
    this._vnpayResponseMessage = vnpayData.responseMessage ?? null;
    this._vnpayBankCode = vnpayData.bankCode ?? null;
    this._vnpayBankTranNo = vnpayData.bankTranNo ?? null;
    this._vnpayPayDate = vnpayData.payDate ?? new Date();
    this._updatedAt = new Date();
  }

  /**
   * Marks the transaction as failed
   */
  markFailed(vnpayData: {
    responseCode: string;
    responseMessage?: string;
  }): void {
    this._status = PaymentStatus.FAILED;
    this._vnpayResponseCode = vnpayData.responseCode;
    this._vnpayResponseMessage = vnpayData.responseMessage ?? null;
    this._updatedAt = new Date();
  }

  /**
   * Marks the transaction as cancelled (e.g., timeout)
   */
  markCancelled(): void {
    this._status = PaymentStatus.CANCELLED;
    this._updatedAt = new Date();
  }

  /**
   * Checks if the transaction is pending
   */
  isPending(): boolean {
    return this._status === PaymentStatus.PENDING;
  }

  /**
   * Checks if the transaction is successful
   */
  isSuccess(): boolean {
    return this._status === PaymentStatus.SUCCESS;
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get topupId(): string | null {
    return this._topupId;
  }

  get orderId(): string | null {
    return this._orderId;
  }

  get relatedOrderIds(): string[] {
    return this._relatedOrderIds;
  }

  /**
   * Gets all order IDs associated with this transaction.
   * Returns relatedOrderIds if available, otherwise falls back to [orderId].
   */
  getAllOrderIds(): string[] {
    if (this._relatedOrderIds.length > 0) {
      return this._relatedOrderIds;
    }
    return this._orderId ? [this._orderId] : [];
  }

  get type(): PaymentType {
    return this._type;
  }

  get amount(): number {
    return this._amount;
  }

  get status(): PaymentStatus {
    return this._status;
  }

  get vnpayTxnRef(): string {
    return this._vnpayTxnRef;
  }

  get vnpayTransactionNo(): string | null {
    return this._vnpayTransactionNo;
  }

  get vnpayResponseCode(): string | null {
    return this._vnpayResponseCode;
  }

  get vnpayResponseMessage(): string | null {
    return this._vnpayResponseMessage;
  }

  get vnpayBankCode(): string | null {
    return this._vnpayBankCode;
  }

  get vnpayBankTranNo(): string | null {
    return this._vnpayBankTranNo;
  }

  get vnpayPayDate(): Date | null {
    return this._vnpayPayDate;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}

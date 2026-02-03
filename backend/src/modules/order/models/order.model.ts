import { v7 as uuidv7 } from 'uuid';
import { Result, ok, err } from 'neverthrow';
import {
  createDomainError,
  DomainError,
} from 'src/shared/types/domain-error.type';
import { OrderStatus } from 'src/database/typeorm/entities/order/enums/order-status.enum';
import { PaymentStatus } from 'src/database/typeorm/entities/order/enums/payment-status.enum';
import { PaymentMethod } from 'src/database/typeorm/entities/order/enums/payment-method.enum';
import { CancelledBy } from 'src/database/typeorm/entities/order/enums/cancelled-by.enum';
import { OrderItem } from './order-item.model';

const ORDER_ERRORS = {
  INVALID_STATUS_TRANSITION: {
    code: 'ORDER_INVALID_STATUS_TRANSITION',
    message: 'Không thể chuyển sang trạng thái này.',
  },
  ORDER_NOT_CANCELLABLE: {
    code: 'ORDER_NOT_CANCELLABLE',
    message: 'Đơn hàng không thể hủy ở trạng thái hiện tại.',
  },
} as const;

/**
 * Order Domain Model
 * Represents a buyer's order to a shop with status management.
 */
export class Order {
  private _items: OrderItem[];

  constructor(
    private readonly _id: string,
    private readonly _orderCode: string,
    private readonly _buyerId: string,
    private readonly _shopId: string,
    private readonly _receiverName: string,
    private readonly _receiverPhone: string,
    private readonly _shippingAddress: string,
    private readonly _shippingWardId: string | null,
    private readonly _shippingDistrictId: string | null,
    private readonly _shippingProvinceId: string | null,
    private readonly _subtotal: number,
    private readonly _shippingFee: number,
    private readonly _platformFee: number,
    private readonly _platformFeePercent: number,
    private readonly _tierDiscountAmount: number,
    private readonly _tierDiscountPercent: number,
    private readonly _voucherDiscountAmount: number,
    private readonly _coinUsed: number,
    private readonly _platformShipDiscount: number,
    private readonly _totalAmount: number,
    private readonly _buyerTierCode: string,
    private readonly _coinMultiplier: number,
    private _coinEarned: number,
    private readonly _paymentMethod: PaymentMethod,
    private _paymentStatus: PaymentStatus,
    private _paidAt: Date | null,
    private _status: OrderStatus,
    private _confirmedAt: Date | null,
    private _shippedAt: Date | null,
    private _deliveredAt: Date | null,
    private _completedAt: Date | null,
    private _cancelledAt: Date | null,
    private _cancelReason: string | null,
    private _cancelledBy: CancelledBy | null,
    private _cancelledByAdminId: string | null,
    private readonly _buyerNote: string | null,
    private _shopNote: string | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    items: OrderItem[] = [],
  ) {
    this._items = items;
  }

  /**
   * Generates a unique order code
   */
  static generateOrderCode(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${timestamp}-${random}`;
  }

  /**
   * Creates a new order
   */
  static create(params: {
    buyerId: string;
    shopId: string;
    receiverName: string;
    receiverPhone: string;
    shippingAddress: string;
    shippingWardId?: string | null;
    shippingDistrictId?: string | null;
    shippingProvinceId?: string | null;
    subtotal: number;
    shippingFee?: number;
    platformFee?: number;
    platformFeePercent: number;
    tierDiscountAmount?: number;
    tierDiscountPercent?: number;
    voucherDiscountAmount?: number;
    coinUsed?: number;
    platformShipDiscount?: number;
    totalAmount: number;
    buyerTierCode: string;
    coinMultiplier: number;
    paymentMethod: PaymentMethod;
    buyerNote?: string | null;
  }): Order {
    const now = new Date();
    return new Order(
      uuidv7(),
      Order.generateOrderCode(),
      params.buyerId,
      params.shopId,
      params.receiverName,
      params.receiverPhone,
      params.shippingAddress,
      params.shippingWardId ?? null,
      params.shippingDistrictId ?? null,
      params.shippingProvinceId ?? null,
      params.subtotal,
      params.shippingFee ?? 0,
      params.platformFee ?? 0,
      params.platformFeePercent,
      params.tierDiscountAmount ?? 0,
      params.tierDiscountPercent ?? 0,
      params.voucherDiscountAmount ?? 0,
      params.coinUsed ?? 0,
      params.platformShipDiscount ?? 0,
      params.totalAmount,
      params.buyerTierCode,
      params.coinMultiplier,
      0, // coinEarned (calculated after completion)
      params.paymentMethod,
      PaymentStatus.PENDING,
      null, // paidAt
      OrderStatus.PENDING,
      null, // confirmedAt
      null, // shippedAt
      null, // deliveredAt
      null, // completedAt
      null, // cancelledAt
      null, // cancelReason
      null, // cancelledBy
      null, // cancelledByAdminId
      params.buyerNote ?? null,
      null, // shopNote
      now,
      now,
      [],
    );
  }

  // ======================== STATUS TRANSITIONS ========================

  /**
   * Shop confirms the order
   */
  confirm(): Result<void, DomainError> {
    if (this._status !== OrderStatus.PENDING) {
      return err(createDomainError(ORDER_ERRORS.INVALID_STATUS_TRANSITION));
    }
    this._status = OrderStatus.CONFIRMED;
    this._confirmedAt = new Date();
    this._updatedAt = new Date();
    return ok(undefined);
  }

  /**
   * Shop ships the order
   */
  ship(): Result<void, DomainError> {
    if (this._status !== OrderStatus.CONFIRMED) {
      return err(createDomainError(ORDER_ERRORS.INVALID_STATUS_TRANSITION));
    }
    this._status = OrderStatus.SHIPPING;
    this._shippedAt = new Date();
    this._updatedAt = new Date();
    return ok(undefined);
  }

  /**
   * Buyer confirms receipt / Auto-complete
   * Flow: SHIPPING → COMPLETED (no DELIVERED status)
   */
  complete(): Result<void, DomainError> {
    if (this._status !== OrderStatus.SHIPPING) {
      return err(createDomainError(ORDER_ERRORS.INVALID_STATUS_TRANSITION));
    }
    this._status = OrderStatus.COMPLETED;
    this._completedAt = new Date();
    // Calculate coin earned: 1000 VND = 1 coin, multiplied by tier multiplier
    // Example: 50000 VND with tier multiplier 1.5 = floor(50000/1000) * 1.5 = 75 coins
    this._coinEarned = Math.floor(
      Math.floor(this._totalAmount / 1000) * this._coinMultiplier,
    );
    this._updatedAt = new Date();
    return ok(undefined);
  }

  /**
   * Checks if order can be cancelled
   */
  canBeCancelled(): boolean {
    return [
      OrderStatus.PENDING,
      OrderStatus.CONFIRMED,
      OrderStatus.SHIPPING,
    ].includes(this._status);
  }

  /**
   * Cancels the order
   */
  cancel(cancelledBy: CancelledBy, reason?: string): Result<void, DomainError> {
    if (!this.canBeCancelled()) {
      return err(createDomainError(ORDER_ERRORS.ORDER_NOT_CANCELLABLE));
    }
    this._status = OrderStatus.CANCELLED;
    this._cancelledAt = new Date();
    this._cancelledBy = cancelledBy;
    this._cancelReason = reason ?? null;
    this._updatedAt = new Date();
    return ok(undefined);
  }

  /**
   * Checks if buyer can cancel
   * Buyer can only cancel if order is pending
   */
  canBuyerCancel(): boolean {
    return this._status === OrderStatus.PENDING;
  }

  /**
   * Checks if shop can cancel
   * Shop can cancel if order is pending or confirmed
   */
  canShopCancel(): boolean {
    return [OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(this._status);
  }

  /**
   * Marks payment as paid
   */
  markAsPaid(): void {
    this._paymentStatus = PaymentStatus.PAID;
    this._paidAt = new Date();
    this._updatedAt = new Date();
  }

  /**
   * Marks payment as refunded
   */
  markAsRefunded(): void {
    this._paymentStatus = PaymentStatus.REFUNDED;
    this._updatedAt = new Date();
  }

  /**
   * Sets shop note
   */
  setShopNote(note: string | null): void {
    this._shopNote = note;
    this._updatedAt = new Date();
  }

  /**
   * Sets platform fee info (called when escrow is created)
   */
  setPlatformFee(feePercent: number): void {
    (this as unknown as { _platformFeePercent: number })._platformFeePercent =
      feePercent;
    (this as unknown as { _platformFee: number })._platformFee = Math.round(
      this._subtotal * (feePercent / 100),
    );
    this._updatedAt = new Date();
  }

  /**
   * Adds an item to the order
   */
  addItem(item: OrderItem): void {
    this._items.push(item);
  }

  /**
   * Sets items (used by mapper)
   */
  setItems(items: OrderItem[]): void {
    this._items = items;
  }

  // ======================== GETTERS ========================

  get id(): string {
    return this._id;
  }

  get orderCode(): string {
    return this._orderCode;
  }

  get buyerId(): string {
    return this._buyerId;
  }

  get shopId(): string {
    return this._shopId;
  }

  get receiverName(): string {
    return this._receiverName;
  }

  get receiverPhone(): string {
    return this._receiverPhone;
  }

  get shippingAddress(): string {
    return this._shippingAddress;
  }

  get shippingWardId(): string | null {
    return this._shippingWardId;
  }

  get shippingDistrictId(): string | null {
    return this._shippingDistrictId;
  }

  get shippingProvinceId(): string | null {
    return this._shippingProvinceId;
  }

  get subtotal(): number {
    return this._subtotal;
  }

  get shippingFee(): number {
    return this._shippingFee;
  }

  get platformFee(): number {
    return this._platformFee;
  }

  get platformFeePercent(): number {
    return this._platformFeePercent;
  }

  get tierDiscountAmount(): number {
    return this._tierDiscountAmount;
  }

  get tierDiscountPercent(): number {
    return this._tierDiscountPercent;
  }

  get voucherDiscountAmount(): number {
    return this._voucherDiscountAmount;
  }

  get coinUsed(): number {
    return this._coinUsed;
  }

  get platformShipDiscount(): number {
    return this._platformShipDiscount;
  }

  get totalAmount(): number {
    return this._totalAmount;
  }

  get buyerTierCode(): string {
    return this._buyerTierCode;
  }

  get coinMultiplier(): number {
    return this._coinMultiplier;
  }

  get coinEarned(): number {
    return this._coinEarned;
  }

  get paymentMethod(): PaymentMethod {
    return this._paymentMethod;
  }

  get paymentStatus(): PaymentStatus {
    return this._paymentStatus;
  }

  get paidAt(): Date | null {
    return this._paidAt;
  }

  get status(): OrderStatus {
    return this._status;
  }

  get confirmedAt(): Date | null {
    return this._confirmedAt;
  }

  get shippedAt(): Date | null {
    return this._shippedAt;
  }

  get deliveredAt(): Date | null {
    return this._deliveredAt;
  }

  get completedAt(): Date | null {
    return this._completedAt;
  }

  get cancelledAt(): Date | null {
    return this._cancelledAt;
  }

  get cancelReason(): string | null {
    return this._cancelReason;
  }

  get cancelledBy(): CancelledBy | null {
    return this._cancelledBy;
  }

  get cancelledByAdminId(): string | null {
    return this._cancelledByAdminId;
  }

  get buyerNote(): string | null {
    return this._buyerNote;
  }

  get shopNote(): string | null {
    return this._shopNote;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get items(): OrderItem[] {
    return [...this._items];
  }

  get itemCount(): number {
    return this._items.reduce((sum, item) => sum + item.quantity, 0);
  }
}

import { v7 as uuidv7 } from 'uuid';
import { Result, ok, err } from 'neverthrow';
import {
  createDomainError,
  DomainError,
} from 'src/shared/types/domain-error.type';
import { EscrowStatus } from 'src/database/typeorm/entities/payment/enums/escrow-status.enum';
import { PAYMENT_ERRORS } from '../errors/payment.errors';

/**
 * EscrowHold Domain Model
 * Represents money held during order processing.
 */
export class EscrowHold {
  constructor(
    private readonly _id: string,
    private readonly _orderId: string,
    private readonly _shopId: string,
    private readonly _amount: number,
    private readonly _orderSubtotal: number,
    private readonly _coinUsed: number,
    private readonly _platformFeePercent: number,
    private _status: EscrowStatus,
    private _releasedAt: Date | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  /**
   * Creates a new escrow hold
   * @param params.amount - The actual amount held (totalAmount paid by buyer)
   * @param params.orderSubtotal - Original order value before coin discount
   * @param params.coinUsed - Coins used by buyer
   * @param params.platformFeePercent - Platform fee percent (already includes badge discount)
   */
  static create(params: {
    orderId: string;
    shopId: string;
    amount: number;
    orderSubtotal: number;
    coinUsed: number;
    platformFeePercent: number;
  }): EscrowHold {
    const now = new Date();
    return new EscrowHold(
      uuidv7(),
      params.orderId,
      params.shopId,
      params.amount,
      params.orderSubtotal,
      params.coinUsed,
      params.platformFeePercent,
      EscrowStatus.HOLDING,
      null,
      now,
      now,
    );
  }

  /**
   * Releases the escrow hold to the shop
   */
  release(): Result<void, DomainError> {
    if (this._status !== EscrowStatus.HOLDING) {
      return err(
        createDomainError(PAYMENT_ERRORS.ESCROW_ALREADY_RELEASED, {
          cause: null,
        }),
      );
    }
    this._status = EscrowStatus.RELEASED;
    this._releasedAt = new Date();
    this._updatedAt = new Date();
    return ok(undefined);
  }

  /**
   * Refunds the escrow hold to the buyer
   */
  refund(): Result<void, DomainError> {
    if (this._status !== EscrowStatus.HOLDING) {
      return err(
        createDomainError(PAYMENT_ERRORS.ESCROW_ALREADY_RELEASED, {
          cause: null,
        }),
      );
    }
    this._status = EscrowStatus.REFUNDED;
    this._releasedAt = new Date();
    this._updatedAt = new Date();
    return ok(undefined);
  }

  /**
   * Checks if the escrow is still holding
   */
  isHolding(): boolean {
    return this._status === EscrowStatus.HOLDING;
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get orderId(): string {
    return this._orderId;
  }

  get shopId(): string {
    return this._shopId;
  }

  get amount(): number {
    return this._amount;
  }

  get orderSubtotal(): number {
    return this._orderSubtotal;
  }

  get coinUsed(): number {
    return this._coinUsed;
  }

  get platformFeePercent(): number {
    return this._platformFeePercent;
  }

  get status(): EscrowStatus {
    return this._status;
  }

  get releasedAt(): Date | null {
    return this._releasedAt;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}

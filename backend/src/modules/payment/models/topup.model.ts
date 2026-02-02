import { v7 as uuidv7 } from 'uuid';
import { TopupStatus } from 'src/database/typeorm/entities/payment/enums/topup-status.enum';

/**
 * Topup Domain Model
 * Represents a wallet topup request (similar to Order for checkout).
 * Tracks the lifecycle of a topup from creation to completion/failure.
 */
export class Topup {
  constructor(
    private readonly _id: string,
    private readonly _walletId: string,
    private readonly _amount: number,
    private _status: TopupStatus,
    private _failureReason: string | null,
    private readonly _createdAt: Date,
    private _processedAt: Date | null,
  ) {}

  /**
   * Creates a new topup request
   */
  static create(params: { walletId: string; amount: number }): Topup {
    return new Topup(
      uuidv7(),
      params.walletId,
      params.amount,
      TopupStatus.PROCESSING,
      null,
      new Date(),
      null,
    );
  }

  /**
   * Marks the topup as successful
   */
  markSuccess(): void {
    this._status = TopupStatus.SUCCESS;
    this._processedAt = new Date();
  }

  /**
   * Marks the topup as failed
   */
  markFailed(reason?: string): void {
    this._status = TopupStatus.FAILED;
    this._failureReason = reason ?? null;
    this._processedAt = new Date();
  }

  /**
   * Checks if the topup is still processing
   */
  isProcessing(): boolean {
    return this._status === TopupStatus.PROCESSING;
  }

  /**
   * Checks if the topup is successful
   */
  isSuccess(): boolean {
    return this._status === TopupStatus.SUCCESS;
  }

  /**
   * Checks if the topup has failed
   */
  isFailed(): boolean {
    return this._status === TopupStatus.FAILED;
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get walletId(): string {
    return this._walletId;
  }

  get amount(): number {
    return this._amount;
  }

  get status(): TopupStatus {
    return this._status;
  }

  get failureReason(): string | null {
    return this._failureReason;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get processedAt(): Date | null {
    return this._processedAt;
  }
}

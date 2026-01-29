import { v7 as uuidv7 } from 'uuid';
import { PendingReleaseStatus } from 'src/database/typeorm/entities/payment/enums/pending-release-status.enum';

/**
 * PendingRelease Domain Model
 * Tracks escrow releases with retry logic.
 */
export class PendingRelease {
  constructor(
    private readonly _id: string,
    private readonly _escrowHoldId: string,
    private readonly _shopWalletId: string,
    private readonly _amount: number,
    private _status: PendingReleaseStatus,
    private _attempts: number,
    private readonly _maxAttempts: number,
    private _lastError: string | null,
    private readonly _createdAt: Date,
    private _processedAt: Date | null,
    private _nextRetryAt: Date | null,
  ) {}

  /**
   * Creates a new pending release
   */
  static create(params: {
    escrowHoldId: string;
    shopWalletId: string;
    amount: number;
    maxAttempts?: number;
  }): PendingRelease {
    const now = new Date();
    return new PendingRelease(
      uuidv7(),
      params.escrowHoldId,
      params.shopWalletId,
      params.amount,
      PendingReleaseStatus.PENDING,
      0,
      params.maxAttempts ?? 5,
      null,
      now,
      null,
      null,
    );
  }

  /**
   * Marks the release as processing
   */
  startProcessing(): void {
    this._status = PendingReleaseStatus.PROCESSING;
    this._attempts += 1;
  }

  /**
   * Marks the release as completed
   */
  complete(): void {
    this._status = PendingReleaseStatus.COMPLETED;
    this._processedAt = new Date();
    this._nextRetryAt = null;
  }

  /**
   * Marks the release as failed with retry
   */
  fail(error: string): void {
    this._lastError = error;

    if (this._attempts >= this._maxAttempts) {
      this._status = PendingReleaseStatus.FAILED;
      this._nextRetryAt = null;
    } else {
      this._status = PendingReleaseStatus.PENDING;
      // Exponential backoff: 5min, 10min, 20min, 40min, 60min (max)
      const backoffMinutes = Math.min(5 * Math.pow(2, this._attempts - 1), 60);
      this._nextRetryAt = new Date(Date.now() + backoffMinutes * 60 * 1000);
    }
  }

  /**
   * Resets for manual retry (admin)
   */
  resetForRetry(): void {
    this._status = PendingReleaseStatus.PENDING;
    this._attempts = 0;
    this._lastError = null;
    this._nextRetryAt = null;
  }

  /**
   * Checks if the release can be retried
   */
  canRetry(): boolean {
    return (
      this._status === PendingReleaseStatus.PENDING &&
      this._attempts < this._maxAttempts &&
      (this._nextRetryAt === null || this._nextRetryAt <= new Date())
    );
  }

  /**
   * Checks if the release is failed
   */
  isFailed(): boolean {
    return this._status === PendingReleaseStatus.FAILED;
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get escrowHoldId(): string {
    return this._escrowHoldId;
  }

  get shopWalletId(): string {
    return this._shopWalletId;
  }

  get amount(): number {
    return this._amount;
  }

  get status(): PendingReleaseStatus {
    return this._status;
  }

  get attempts(): number {
    return this._attempts;
  }

  get maxAttempts(): number {
    return this._maxAttempts;
  }

  get lastError(): string | null {
    return this._lastError;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get processedAt(): Date | null {
    return this._processedAt;
  }

  get nextRetryAt(): Date | null {
    return this._nextRetryAt;
  }
}

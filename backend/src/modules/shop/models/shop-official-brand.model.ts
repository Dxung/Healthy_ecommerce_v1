import { v7 as uuidv7 } from 'uuid';
import { Result, ok, err } from 'neverthrow';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { BADGE_APPLICATION_ERRORS } from '../errors/badge-application.errors';

/**
 * Domain model for shop official brand.
 *
 * Tracks which brands a shop is officially authorized to represent.
 * When a shop gets OFFICIAL badge approved for a brand, this record is created.
 */
export class ShopOfficialBrand {
  private _brandName?: string;

  constructor(
    private readonly _id: string,
    private readonly _shopId: string,
    private readonly _brandId: string,
    private readonly _applicationId: string | null,
    private readonly _grantedAt: Date,
    private readonly _expiresAt: Date | null,
    private _revokedAt: Date | null,
    private _revokedReason: string | null,
  ) {}

  // ======================== FACTORY METHODS ========================

  /**
   * Creates a new shop official brand record.
   * @param expiresAt - The expiration date, or null for permanent authorization
   */
  static create(
    shopId: string,
    brandId: string,
    applicationId: string,
    expiresAt: Date | null,
  ): ShopOfficialBrand {
    const id = uuidv7();
    const now = new Date();

    return new ShopOfficialBrand(
      id,
      shopId,
      brandId,
      applicationId,
      now, // grantedAt
      expiresAt,
      null, // revokedAt
      null, // revokedReason
    );
  }

  // ======================== BUSINESS RULES ========================

  /**
   * Checks if this official brand status is currently active.
   * Active means not revoked and not expired (or has no expiry).
   */
  public isActive(): boolean {
    return this._revokedAt === null && !this.isExpired();
  }

  /**
   * Checks if this official brand status has been revoked.
   */
  public isRevoked(): boolean {
    return this._revokedAt !== null;
  }

  /**
   * Checks if this official brand status has expired.
   * Returns false if expiresAt is null (permanent, never expires).
   */
  public isExpired(): boolean {
    if (this._expiresAt === null) {
      return false; // Permanent, never expires
    }
    return this._expiresAt < new Date();
  }

  /**
   * Checks if can be revoked.
   */
  public canBeRevoked(): boolean {
    return this._revokedAt === null;
  }

  // ======================== CHANGE METHODS ========================

  /**
   * Revokes this official brand status.
   */
  public revoke(reason: string): Result<void, DomainError> {
    if (!this.canBeRevoked()) {
      return err(
        createDomainError(BADGE_APPLICATION_ERRORS.ALREADY_REVOKED, {
          cause: 'Official brand status already revoked',
        }),
      );
    }

    this._revokedAt = new Date();
    this._revokedReason = reason;
    return ok(undefined);
  }

  /**
   * Sets brand name (for response mapping).
   */
  public setBrandName(brandName: string): void {
    this._brandName = brandName;
  }

  // ======================== GETTERS ========================

  public get id(): string {
    return this._id;
  }

  public get shopId(): string {
    return this._shopId;
  }

  public get brandId(): string {
    return this._brandId;
  }

  public get brandName(): string | undefined {
    return this._brandName;
  }

  public get applicationId(): string | null {
    return this._applicationId;
  }

  public get grantedAt(): Date {
    return this._grantedAt;
  }

  public get expiresAt(): Date | null {
    return this._expiresAt;
  }

  public get revokedAt(): Date | null {
    return this._revokedAt;
  }

  public get revokedReason(): string | null {
    return this._revokedReason;
  }
}

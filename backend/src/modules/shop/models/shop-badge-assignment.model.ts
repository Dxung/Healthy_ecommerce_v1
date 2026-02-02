import { v7 as uuidv7 } from 'uuid';
import { Result, ok, err } from 'neverthrow';
import { ShopBadgeCode } from 'src/database/typeorm/entities/shop/enums/shop-badge-code.enum';
import { ShopBadgeStatus } from 'src/database/typeorm/entities/shop/enums/shop-badge-status.enum';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { SHOP_ERRORS } from '../errors/shop.errors';

/**
 * Domain model for shop badge assignment.
 *
 * Represents a badge (preferred/approved/official) assigned to a shop.
 *
 * **Field Categories:**
 *
 * **Immutable Fields (set at creation, never change):**
 * - id: Unique identifier
 * - shopId: The shop this badge belongs to
 * - badgeCode: Type of badge (preferred/approved/official)
 * - brandId: Brand ID for OFFICIAL badges (null for others)
 * - grantedAt: When badge was granted
 *
 * **Mutable Fields (can be changed via methods):**
 * - status: Current status (active/disabled)
 * - expiresAt: Badge expiration date (for APPROVED/OFFICIAL)
 * - disabledAt: When badge was disabled (null if active)
 * - disabledReason: Reason for disabling (null if active)
 * - updatedAt: Last update timestamp
 */
export class ShopBadgeAssignment {
  constructor(
    private readonly _id: string,
    private readonly _shopId: string,
    private readonly _badgeCode: ShopBadgeCode,
    private readonly _brandId: string | null,
    private _status: ShopBadgeStatus,
    private readonly _grantedAt: Date,
    private _expiresAt: Date | null,
    private _disabledAt: Date | null,
    private _disabledReason: string | null,
    private _updatedAt: Date,
  ) {}

  // ======================== FACTORY METHODS ========================

  /**
   * Creates a new badge assignment (for PREFERRED badge - no expiry).
   * @param shopId - The shop to assign the badge to
   * @param badgeCode - Type of badge (preferred/approved/official)
   */
  static createNew(
    shopId: string,
    badgeCode: ShopBadgeCode,
  ): ShopBadgeAssignment {
    const id = uuidv7();
    const now = new Date();

    return new ShopBadgeAssignment(
      id,
      shopId,
      badgeCode,
      null, // brandId
      ShopBadgeStatus.ACTIVE,
      now,
      null, // expiresAt
      null, // disabledAt
      null, // disabledReason
      now,
    );
  }

  /**
   * Creates a new APPROVED badge with expiration.
   * @param shopId - The shop to assign the badge to
   * @param expiresAt - Expiration date of the badge
   */
  static createApproved(shopId: string, expiresAt: Date): ShopBadgeAssignment {
    const id = uuidv7();
    const now = new Date();

    return new ShopBadgeAssignment(
      id,
      shopId,
      ShopBadgeCode.APPROVED,
      null, // brandId
      ShopBadgeStatus.ACTIVE,
      now,
      expiresAt,
      null, // disabledAt
      null, // disabledReason
      now,
    );
  }

  /**
   * Creates a new OFFICIAL badge for a specific brand.
   * @param shopId - The shop to assign the badge to
   * @param brandId - The brand this badge is for
   * @param expiresAt - Expiration date of the badge
   */
  static createOfficial(
    shopId: string,
    brandId: string,
    expiresAt: Date,
  ): ShopBadgeAssignment {
    const id = uuidv7();
    const now = new Date();

    return new ShopBadgeAssignment(
      id,
      shopId,
      ShopBadgeCode.OFFICIAL,
      brandId,
      ShopBadgeStatus.ACTIVE,
      now,
      expiresAt,
      null, // disabledAt
      null, // disabledReason
      now,
    );
  }

  // ======================== BUSINESS RULES ========================

  /**
   * Checks if the badge has been disabled.
   */
  public isDisabled(): boolean {
    return this._status === ShopBadgeStatus.DISABLED;
  }

  /**
   * Checks if the badge is currently active.
   */
  public isActive(): boolean {
    return this._status === ShopBadgeStatus.ACTIVE;
  }

  /**
   * Checks if the badge has expired.
   */
  public isExpired(): boolean {
    if (!this._expiresAt) return false;
    return this._expiresAt < new Date();
  }

  /**
   * Checks if the badge is for a specific brand (OFFICIAL).
   */
  public isForBrand(brandId: string): boolean {
    return this._brandId === brandId;
  }

  /**
   * Checks if the badge can be disabled.
   * A badge can only be disabled if it's currently active.
   */
  public canBeDisabled(): boolean {
    return this.isActive();
  }

  /**
   * Checks if the badge can be re-enabled.
   * A badge can only be enabled if it's currently disabled.
   */
  public canBeEnabled(): boolean {
    return this.isDisabled();
  }

  // ======================== CHANGE METHODS ========================

  /**
   * Disables this badge.
   * @param reason - Reason for disabling the badge
   * @returns Result indicating success or domain error
   */
  public disable(reason: string): Result<void, DomainError> {
    if (!this.canBeDisabled()) {
      return err(
        createDomainError(SHOP_ERRORS.BADGE_ALREADY_DISABLED, {
          cause: 'Badge has already been disabled',
        }),
      );
    }

    this._status = ShopBadgeStatus.DISABLED;
    this._disabledAt = new Date();
    this._disabledReason = reason;
    this._updatedAt = new Date();
    return ok(undefined);
  }

  /**
   * Re-enables this badge.
   * @returns Result indicating success or domain error
   */
  public enable(): Result<void, DomainError> {
    if (!this.canBeEnabled()) {
      return err(
        createDomainError(SHOP_ERRORS.BADGE_ALREADY_ACTIVE, {
          cause: 'Badge is already active',
        }),
      );
    }

    this._status = ShopBadgeStatus.ACTIVE;
    this._disabledAt = null;
    this._disabledReason = null;
    this._updatedAt = new Date();
    return ok(undefined);
  }

  // ======================== GETTERS ========================

  public get id(): string {
    return this._id;
  }

  public get shopId(): string {
    return this._shopId;
  }

  public get badgeCode(): ShopBadgeCode {
    return this._badgeCode;
  }

  public get brandId(): string | null {
    return this._brandId;
  }

  public get status(): ShopBadgeStatus {
    return this._status;
  }

  public get grantedAt(): Date {
    return this._grantedAt;
  }

  public get expiresAt(): Date | null {
    return this._expiresAt;
  }

  public get disabledAt(): Date | null {
    return this._disabledAt;
  }

  public get disabledReason(): string | null {
    return this._disabledReason;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }
}

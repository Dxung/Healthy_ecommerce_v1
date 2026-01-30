import { ShopBadgeCode } from 'src/database/typeorm/entities/shop/enums/shop-badge-code.enum';
import type { BadgeRequirement } from './badge-requirement.model';

/**
 * Data for updating a badge's properties.
 */
export interface UpdateBadgeData {
  name?: string;
  description?: string | null;
  platformFeeDiscountPercent?: number | null;
  searchBoostMultiplier?: number | null;
  maxProductSlots?: number;
}

/**
 * Domain model for ShopBadge.
 * Represents a badge type configuration (e.g., preferred, approved, official).
 * Badges are hardcoded - admin can only toggle is_active, not add/delete.
 */
export class ShopBadge {
  private _requirements: BadgeRequirement[] = [];

  constructor(
    private readonly _id: string,
    private readonly _code: ShopBadgeCode,
    private _name: string,
    private _description: string | null,
    private _platformFeeDiscountPercent: number | null,
    private _searchBoostMultiplier: number | null,
    private _maxProductSlots: number,
    private _isActive: boolean,
    private _updatedAt: Date,
    private readonly _deletedAt: Date | null,
    requirements: BadgeRequirement[] = [],
  ) {
    this._requirements = requirements;
  }

  // ======================== BUSINESS METHODS ========================

  /**
   * Toggles the badge active status.
   */
  public toggleActive(): void {
    this._isActive = !this._isActive;
    this._updatedAt = new Date();
  }

  /**
   * Sets the badge active status.
   */
  public setActive(active: boolean): void {
    this._isActive = active;
    this._updatedAt = new Date();
  }

  /**
   * Updates badge properties.
   */
  public update(data: UpdateBadgeData): void {
    if (data.name !== undefined) {
      this._name = data.name;
    }
    if (data.description !== undefined) {
      this._description = data.description;
    }
    if (data.platformFeeDiscountPercent !== undefined) {
      this._platformFeeDiscountPercent = data.platformFeeDiscountPercent;
    }
    if (data.searchBoostMultiplier !== undefined) {
      this._searchBoostMultiplier = data.searchBoostMultiplier;
    }
    if (data.maxProductSlots !== undefined) {
      this._maxProductSlots = data.maxProductSlots;
    }
    this._updatedAt = new Date();
  }

  /**
   * Sets the requirements for this badge.
   * Used when loading from database with relations.
   */
  public setRequirements(requirements: BadgeRequirement[]): void {
    this._requirements = requirements;
  }

  /**
   * Gets all active requirements for this badge.
   */
  public getActiveRequirements(): BadgeRequirement[] {
    return this._requirements.filter((req) => req.isActive);
  }

  // ======================== GETTERS ========================

  public get id(): string {
    return this._id;
  }

  public get code(): ShopBadgeCode {
    return this._code;
  }

  public get name(): string {
    return this._name;
  }

  public get description(): string | null {
    return this._description;
  }

  public get platformFeeDiscountPercent(): number | null {
    return this._platformFeeDiscountPercent;
  }

  public get searchBoostMultiplier(): number | null {
    return this._searchBoostMultiplier;
  }

  public get maxProductSlots(): number {
    return this._maxProductSlots;
  }

  public get isActive(): boolean {
    return this._isActive;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public get deletedAt(): Date | null {
    return this._deletedAt;
  }

  public get requirements(): BadgeRequirement[] {
    return this._requirements;
  }
}

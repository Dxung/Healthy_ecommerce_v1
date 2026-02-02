import { v7 as uuidv7 } from 'uuid';
import { Result, ok, err } from 'neverthrow';
import { ShopStatus } from 'src/database/typeorm/entities/shop/enums/shop-status.enum';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { SHOP_ERRORS } from '../errors/shop.errors';
import type { ShopBadgeAssignment } from './shop-badge-assignment.model';

/**
 * Domain model for Shop.
 * Represents an approved shop that can sell products on the platform.
 */
export class Shop {
  private _badgeAssignments: ShopBadgeAssignment[] = [];

  constructor(
    private readonly _id: string,
    private readonly _registrationId: string | null,
    private readonly _userId: string,
    private readonly _name: string,
    private readonly _slug: string,
    private _logoUrl: string | null,
    private _coverUrl: string | null,
    private _phone: string,
    private _email: string,
    private _addressLine: string,
    private _wardId: string,
    private _districtId: string,
    private _provinceId: string,
    private _averageRating: number,
    private _totalRatings: number,
    private _totalProducts: number,
    private _totalOrders: number,
    private _orderSuccessRate: number,
    private _responseTimeHours: number,
    private _returnRate: number,
    private _status: ShopStatus,
    private _isRefundDebt: boolean,
    private _isAdminSuspended: boolean,
    private _statusReason: string | null,
    private _statusChangedAt: Date | null,
    private _statusChangedBy: string | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _deletedAt: Date | null,
    badgeAssignments: ShopBadgeAssignment[] = [],
  ) {
    this._badgeAssignments = badgeAssignments;
  }

  // ======================== FACTORY METHODS ========================

  /**
   * Creates a new Shop directly (for immediate registration without admin approval).
   * Shop starts with ACTIVE status, no badges, limited product slots.
   */
  static createNew(data: {
    userId: string;
    name: string;
    slug: string;
    phone: string;
    email: string;
    addressLine: string;
    wardId: string;
    districtId: string;
    provinceId: string;
  }): Shop {
    const now = new Date();
    return new Shop(
      uuidv7(),
      null, // registrationId - null for direct registration
      data.userId,
      data.name,
      data.slug,
      null, // logoUrl
      null, // coverUrl
      data.phone,
      data.email,
      data.addressLine,
      data.wardId,
      data.districtId,
      data.provinceId,
      0, // averageRating
      0, // totalRatings
      0, // totalProducts
      0, // totalOrders
      0, // orderSuccessRate
      0, // responseTimeHours
      0, // returnRate
      ShopStatus.ACTIVE,
      false, // isRefundDebt
      false, // isAdminSuspended
      null, // statusReason
      null, // statusChangedAt
      null, // statusChangedBy
      now, // createdAt
      now, // updatedAt
      null, // deletedAt
      [], // badgeAssignments
    );
  }

  /**
   * Generates a URL-friendly slug from shop name.
   * Handles Vietnamese diacritics.
   */
  static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with dashes
      .replace(/^-+|-+$/g, ''); // Trim leading/trailing dashes
  }

  // ======================== BADGE METHODS ========================

  /**
   * Adds a badge assignment to the shop.
   * Used when loading from database with relations.
   */
  public addBadgeAssignment(badge: ShopBadgeAssignment): void {
    this._badgeAssignments.push(badge);
  }

  /**
   * Sets the badge assignments for the shop.
   * Used when mapping from ORM with eager-loaded relations.
   */
  public setBadgeAssignments(badges: ShopBadgeAssignment[]): void {
    this._badgeAssignments = badges;
  }

  /**
   * Gets all active badges for the shop.
   */
  public getActiveBadges(): ShopBadgeAssignment[] {
    return this._badgeAssignments.filter((badge) => badge.isActive());
  }

  // ======================== BUSINESS RULES ========================

  public canBeDeactivated(): boolean {
    return this._status === ShopStatus.ACTIVE;
  }

  public canBeActivated(): boolean {
    return this._status === ShopStatus.INACTIVE;
  }

  public isVisible(): boolean {
    return this._status === ShopStatus.ACTIVE && !this._isAdminSuspended;
  }

  public canSell(): boolean {
    return (
      this._status === ShopStatus.ACTIVE &&
      !this._isAdminSuspended &&
      !this._isRefundDebt
    );
  }

  // ======================== STATUS CHANGE METHODS ========================

  public deactivate(): Result<void, DomainError> {
    if (!this.canBeDeactivated()) {
      return err(
        createDomainError(SHOP_ERRORS.CANNOT_DEACTIVATE, {
          cause: `Cannot deactivate shop with status: ${this._status}`,
        }),
      );
    }
    this._status = ShopStatus.INACTIVE;
    this._updatedAt = new Date();
    return ok(undefined);
  }

  public activate(): Result<void, DomainError> {
    if (!this.canBeActivated()) {
      return err(
        createDomainError(SHOP_ERRORS.CANNOT_ACTIVATE, {
          cause: `Cannot activate shop with status: ${this._status}`,
        }),
      );
    }
    this._status = ShopStatus.ACTIVE;
    this._updatedAt = new Date();
    return ok(undefined);
  }

  // ======================== GETTERS ========================

  public get id(): string {
    return this._id;
  }

  public get registrationId(): string | null {
    return this._registrationId;
  }

  public get userId(): string {
    return this._userId;
  }

  public get name(): string {
    return this._name;
  }

  public get slug(): string {
    return this._slug;
  }

  public get logoUrl(): string | null {
    return this._logoUrl;
  }

  public get coverUrl(): string | null {
    return this._coverUrl;
  }

  public get phone(): string {
    return this._phone;
  }

  public get email(): string {
    return this._email;
  }

  public get addressLine(): string {
    return this._addressLine;
  }

  public get wardId(): string {
    return this._wardId;
  }

  public get districtId(): string {
    return this._districtId;
  }

  public get provinceId(): string {
    return this._provinceId;
  }

  public get averageRating(): number {
    return this._averageRating;
  }

  public get totalRatings(): number {
    return this._totalRatings;
  }

  public get totalProducts(): number {
    return this._totalProducts;
  }

  public get totalOrders(): number {
    return this._totalOrders;
  }

  public get orderSuccessRate(): number {
    return this._orderSuccessRate;
  }

  public get responseTimeHours(): number {
    return this._responseTimeHours;
  }

  public get returnRate(): number {
    return this._returnRate;
  }

  public get status(): ShopStatus {
    return this._status;
  }

  public get isRefundDebt(): boolean {
    return this._isRefundDebt;
  }

  public get isAdminSuspended(): boolean {
    return this._isAdminSuspended;
  }

  public get statusReason(): string | null {
    return this._statusReason;
  }

  public get statusChangedAt(): Date | null {
    return this._statusChangedAt;
  }

  public get statusChangedBy(): string | null {
    return this._statusChangedBy;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public get deletedAt(): Date | null {
    return this._deletedAt;
  }

  public get badgeAssignments(): ShopBadgeAssignment[] {
    return this._badgeAssignments;
  }
}

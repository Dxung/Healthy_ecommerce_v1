/**
 * UserAddress Domain Model
 * Represents a user's delivery address with full location details
 */
export class UserAddress {
  constructor(
    private readonly _id: string,
    private readonly _userId: string,
    private readonly _label: string,
    private readonly _recipientName: string,
    private readonly _recipientPhone: string,
    private readonly _addressLine: string,
    private readonly _wardId: string,
    private readonly _districtId: string,
    private readonly _provinceId: string,
    private readonly _latitude: number | null,
    private readonly _longitude: number | null,
    private readonly _isDefault: boolean,
    private readonly _createdAt: Date,
    private readonly _updatedAt: Date,
  ) {}

  get id(): string {
    return this._id;
  }

  get userId(): string {
    return this._userId;
  }

  get label(): string {
    return this._label;
  }

  get recipientName(): string {
    return this._recipientName;
  }

  get recipientPhone(): string {
    return this._recipientPhone;
  }

  get addressLine(): string {
    return this._addressLine;
  }

  get wardId(): string {
    return this._wardId;
  }

  get districtId(): string {
    return this._districtId;
  }

  get provinceId(): string {
    return this._provinceId;
  }

  get latitude(): number | null {
    return this._latitude;
  }

  get longitude(): number | null {
    return this._longitude;
  }

  get isDefault(): boolean {
    return this._isDefault;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  /**
   * Checks if this address belongs to the specified user
   */
  belongsToUser(userId: string): boolean {
    return this._userId === userId;
  }

  /**
   * Applies updates to the address and returns a new instance.
   * Uses nullish coalescing to preserve existing values if updates are undefined.
   * @param updates - Partial updates to apply
   * @returns New UserAddress instance with updates applied
   */
  public applyUpdates(updates: {
    label?: string;
    recipientName?: string;
    recipientPhone?: string;
    addressLine?: string;
    wardId?: string;
    districtId?: string;
    provinceId?: string;
    latitude?: number;
    longitude?: number;
    isDefault?: boolean;
  }): UserAddress {
    return new UserAddress(
      this._id,
      this._userId,
      updates.label ?? this._label,
      updates.recipientName ?? this._recipientName,
      updates.recipientPhone ?? this._recipientPhone,
      updates.addressLine ?? this._addressLine,
      updates.wardId ?? this._wardId,
      updates.districtId ?? this._districtId,
      updates.provinceId ?? this._provinceId,
      updates.latitude ?? this._latitude,
      updates.longitude ?? this._longitude,
      updates.isDefault ?? this._isDefault,
      this._createdAt,
      new Date(), // Updated timestamp
    );
  }
}

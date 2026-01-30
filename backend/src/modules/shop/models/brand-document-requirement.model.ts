import { v7 as uuidv7 } from 'uuid';

/**
 * Domain model for brand document requirement.
 *
 * Admin-configurable document requirements per brand for Official badge applications.
 */
export class BrandDocumentRequirement {
  constructor(
    private readonly _id: string,
    private readonly _brandId: string,
    private readonly _documentTypeId: string,
    private _isActive: boolean,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  // ======================== FACTORY METHODS ========================

  /**
   * Creates a new brand document requirement.
   */
  static create(brandId: string, documentTypeId: string): BrandDocumentRequirement {
    const id = uuidv7();
    const now = new Date();

    return new BrandDocumentRequirement(
      id,
      brandId,
      documentTypeId,
      true, // isActive
      now,
      now,
    );
  }

  // ======================== BUSINESS RULES ========================

  /**
   * Toggles active status.
   */
  public toggleActive(): void {
    this._isActive = !this._isActive;
    this._updatedAt = new Date();
  }

  /**
   * Sets active status.
   */
  public setActive(active: boolean): void {
    this._isActive = active;
    this._updatedAt = new Date();
  }

  // ======================== GETTERS ========================

  public get id(): string {
    return this._id;
  }

  public get brandId(): string {
    return this._brandId;
  }

  public get documentTypeId(): string {
    return this._documentTypeId;
  }

  public get isActive(): boolean {
    return this._isActive;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }
}

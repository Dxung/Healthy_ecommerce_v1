import { v7 as uuidv7 } from 'uuid';

/**
 * Domain model for Brand.
 * Represents product brands/manufacturers.
 */
export class Brand {
  constructor(
    private readonly _id: string,
    private _name: string,
    private _slug: string,
    private _logoUrl: string | null,
    private _description: string | null,
    private _isActive: boolean,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _deletedAt: Date | null,
  ) {}

  // ======================== FACTORY METHODS ========================

  /**
   * Creates a new brand.
   */
  static create(params: {
    name: string;
    slug: string;
    logoUrl?: string | null;
    description?: string | null;
  }): Brand {
    const now = new Date();
    return new Brand(
      uuidv7(),
      params.name,
      params.slug,
      params.logoUrl ?? null,
      params.description ?? null,
      true, // isActive
      now,
      now,
      null,
    );
  }

  // ======================== UPDATE METHODS ========================

  updateInfo(
    name: string,
    slug: string,
    description?: string | null,
  ): void {
    this._name = name;
    this._slug = slug;
    if (description !== undefined) {
      this._description = description;
    }
    this._updatedAt = new Date();
  }

  updateLogo(logoUrl: string | null): void {
    this._logoUrl = logoUrl;
    this._updatedAt = new Date();
  }

  activate(): void {
    this._isActive = true;
    this._updatedAt = new Date();
  }

  deactivate(): void {
    this._isActive = false;
    this._updatedAt = new Date();
  }

  // ======================== GETTERS ========================

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get slug(): string {
    return this._slug;
  }

  get logoUrl(): string | null {
    return this._logoUrl;
  }

  get description(): string | null {
    return this._description;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get deletedAt(): Date | null {
    return this._deletedAt;
  }
}

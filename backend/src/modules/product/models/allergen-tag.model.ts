import { v7 as uuidv7 } from 'uuid';

/**
 * Domain model for AllergenTag.
 * Represents allergen categories (e.g., Nuts, Dairy, Gluten).
 */
export class AllergenTag {
  constructor(
    private readonly _id: string,
    private _name: string,
    private _slug: string,
    private _description: string | null,
    private _iconUrl: string | null,
    private _isActive: boolean,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  // ======================== FACTORY METHODS ========================

  /**
   * Creates a new allergen tag.
   */
  static create(params: {
    name: string;
    slug: string;
    description?: string | null;
    iconUrl?: string | null;
  }): AllergenTag {
    const now = new Date();
    return new AllergenTag(
      uuidv7(),
      params.name,
      params.slug,
      params.description ?? null,
      params.iconUrl ?? null,
      true, // isActive
      now,
      now,
    );
  }

  // ======================== UPDATE METHODS ========================

  updateInfo(name: string, slug: string, description?: string | null): void {
    this._name = name;
    this._slug = slug;
    if (description !== undefined) {
      this._description = description;
    }
    this._updatedAt = new Date();
  }

  updateIcon(iconUrl: string | null): void {
    this._iconUrl = iconUrl;
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

  get description(): string | null {
    return this._description;
  }

  get iconUrl(): string | null {
    return this._iconUrl;
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
}

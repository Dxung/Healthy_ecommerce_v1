import { v7 as uuidv7 } from 'uuid';

/**
 * Domain model for DocumentType.
 * Represents a type of document that shops can submit for verification.
 */
export class DocumentType {
  constructor(
    private readonly _id: string,
    private _name: string,
    private _description: string | null,
    private _sampleImageUrl: string | null,
    private _isActive: boolean,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  // ======================== FACTORY METHODS ========================

  /**
   * Creates a new DocumentType.
   */
  static createNew(data: {
    name: string;
    description?: string | null;
    sampleImageUrl?: string | null;
  }): DocumentType {
    const now = new Date();
    return new DocumentType(
      uuidv7(),
      data.name,
      data.description ?? null,
      data.sampleImageUrl ?? null,
      true, // isActive by default
      now,
      now,
    );
  }

  // ======================== BUSINESS METHODS ========================

  /**
   * Updates the document type information.
   */
  public update(data: {
    name?: string;
    description?: string | null;
    sampleImageUrl?: string | null;
  }): void {
    if (data.name !== undefined) {
      this._name = data.name;
    }
    if (data.description !== undefined) {
      this._description = data.description;
    }
    if (data.sampleImageUrl !== undefined) {
      this._sampleImageUrl = data.sampleImageUrl;
    }
    this._updatedAt = new Date();
  }

  /**
   * Toggles the active status.
   */
  public toggleActive(): void {
    this._isActive = !this._isActive;
    this._updatedAt = new Date();
  }

  /**
   * Sets the active status.
   */
  public setActive(active: boolean): void {
    this._isActive = active;
    this._updatedAt = new Date();
  }

  // ======================== GETTERS ========================

  public get id(): string {
    return this._id;
  }

  public get name(): string {
    return this._name;
  }

  public get description(): string | null {
    return this._description;
  }

  public get sampleImageUrl(): string | null {
    return this._sampleImageUrl;
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

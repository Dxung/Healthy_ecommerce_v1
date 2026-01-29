import { v7 as uuidv7 } from 'uuid';

/**
 * System Configuration Model
 * Represents a key-value configuration entry in the system
 */
export class SystemConfig {
  constructor(
    private readonly _id: string,
    private readonly _key: string,
    private _value: string,
    private _description: string | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  get id(): string {
    return this._id;
  }

  get key(): string {
    return this._key;
  }

  get value(): string {
    return this._value;
  }

  get description(): string | null {
    return this._description;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  /**
   * Get value as number
   */
  getNumberValue(): number {
    return parseFloat(this._value) || 0;
  }

  /**
   * Get value as boolean
   */
  getBooleanValue(): boolean {
    return this._value.toLowerCase() === 'true';
  }

  /**
   * Update the configuration value
   */
  updateValue(newValue: string): void {
    this._value = newValue;
    this._updatedAt = new Date();
  }

  /**
   * Update description
   */
  updateDescription(description: string | null): void {
    this._description = description;
    this._updatedAt = new Date();
  }

  /**
   * Create a new system config entry
   */
  static create(params: {
    key: string;
    value: string;
    description?: string | null;
  }): SystemConfig {
    const now = new Date();
    return new SystemConfig(
      uuidv7(),
      params.key,
      params.value,
      params.description ?? null,
      now,
      now,
    );
  }

  /**
   * Reconstruct from persistence
   */
  static fromPersistence(params: {
    id: string;
    key: string;
    value: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): SystemConfig {
    return new SystemConfig(
      params.id,
      params.key,
      params.value,
      params.description,
      params.createdAt,
      params.updatedAt,
    );
  }
}

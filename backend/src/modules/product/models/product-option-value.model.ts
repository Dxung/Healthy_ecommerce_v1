import { v7 as uuidv7 } from 'uuid';

/**
 * Domain model for ProductOptionValue.
 * Represents a specific value for an option (e.g., "S", "M", "L" for Size).
 */
export class ProductOptionValue {
  constructor(
    private readonly _id: string,
    private readonly _optionId: string,
    private _value: string,
    private _sortOrder: number,
    private readonly _createdAt: Date,
  ) {}

  // ======================== FACTORY METHODS ========================

  /**
   * Creates a new option value.
   */
  static create(
    optionId: string,
    value: string,
    sortOrder: number = 0,
  ): ProductOptionValue {
    return new ProductOptionValue(
      uuidv7(),
      optionId,
      value,
      sortOrder,
      new Date(),
    );
  }

  // ======================== GETTERS ========================

  get id(): string {
    return this._id;
  }

  get optionId(): string {
    return this._optionId;
  }

  get value(): string {
    return this._value;
  }

  get sortOrder(): number {
    return this._sortOrder;
  }

  get createdAt(): Date {
    return this._createdAt;
  }
}

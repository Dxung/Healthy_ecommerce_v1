import { v7 as uuidv7 } from 'uuid';

/**
 * Domain model for Unit Conversion.
 * Represents a conversion factor between two units.
 * Always stores conversion TO the base unit (kg → g = 1000).
 */
export class UnitConversion {
  constructor(
    private readonly _id: string,
    private readonly _fromUnitId: string,
    private readonly _toUnitId: string,
    private _conversionFactor: number,
    private _isActive: boolean,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  // ======================== FACTORY METHODS ========================

  /**
   * Creates a new unit conversion.
   */
  static create(params: {
    fromUnitId: string;
    toUnitId: string;
    conversionFactor: number;
  }): UnitConversion {
    const now = new Date();
    return new UnitConversion(
      uuidv7(),
      params.fromUnitId,
      params.toUnitId,
      params.conversionFactor,
      true, // isActive
      now,
      now,
    );
  }

  // ======================== BUSINESS METHODS ========================

  /**
   * Converts a value using this conversion factor.
   * @param value - The value to convert.
   * @returns The converted value.
   */
  convert(value: number): number {
    return value * this._conversionFactor;
  }

  /**
   * Converts a value in reverse (target → source).
   * @param value - The value to convert.
   * @returns The converted value.
   */
  convertReverse(value: number): number {
    return value / this._conversionFactor;
  }

  /**
   * Gets the reverse conversion factor.
   */
  getReverseFactor(): number {
    return 1 / this._conversionFactor;
  }

  // ======================== UPDATE METHODS ========================

  /**
   * Updates the conversion factor.
   */
  updateFactor(factor: number): void {
    this._conversionFactor = factor;
    this._updatedAt = new Date();
  }

  /**
   * Activates the conversion.
   */
  activate(): void {
    this._isActive = true;
    this._updatedAt = new Date();
  }

  /**
   * Deactivates the conversion.
   */
  deactivate(): void {
    this._isActive = false;
    this._updatedAt = new Date();
  }

  // ======================== GETTERS ========================

  get id(): string {
    return this._id;
  }

  get fromUnitId(): string {
    return this._fromUnitId;
  }

  get toUnitId(): string {
    return this._toUnitId;
  }

  get conversionFactor(): number {
    return this._conversionFactor;
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

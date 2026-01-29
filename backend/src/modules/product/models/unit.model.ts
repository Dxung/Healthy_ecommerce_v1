import { v7 as uuidv7 } from 'uuid';
import { UnitCategory } from 'src/database/typeorm/entities/product/enums/unit-category.enum';
import { UnitType } from 'src/database/typeorm/entities/product/enums/unit-type.enum';

/**
 * Domain model for Unit.
 * Represents both measurement units (g, kg, ml, L) and selling units (Box, Pack).
 */
export class Unit {
  constructor(
    private readonly _id: string,
    private _name: string,
    private _symbol: string,
    private readonly _category: UnitCategory,
    private _type: UnitType | null,
    private readonly _isBase: boolean,
    private _isActive: boolean,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _deletedAt: Date | null,
  ) {}

  // ======================== FACTORY METHODS ========================

  /**
   * Creates a new unit.
   */
  static create(params: {
    name: string;
    symbol: string;
    category: UnitCategory;
    type?: UnitType | null;
    isBase?: boolean;
  }): Unit {
    const now = new Date();
    return new Unit(
      uuidv7(),
      params.name,
      params.symbol,
      params.category,
      params.type ?? null,
      params.isBase ?? false,
      true, // isActive
      now,
      now,
      null,
    );
  }

  /**
   * Creates a measurement unit.
   */
  static createMeasurement(
    name: string,
    symbol: string,
    type: UnitType,
    isBase = false,
  ): Unit {
    return Unit.create({
      name,
      symbol,
      category: UnitCategory.MEASUREMENT,
      type,
      isBase,
    });
  }

  /**
   * Creates a selling unit.
   */
  static createSelling(name: string, symbol: string): Unit {
    return Unit.create({
      name,
      symbol,
      category: UnitCategory.SELLING,
      type: null,
      isBase: false,
    });
  }

  // ======================== BUSINESS RULES ========================

  /**
   * Checks if this is a measurement unit.
   */
  isMeasurementUnit(): boolean {
    return this._category === UnitCategory.MEASUREMENT;
  }

  /**
   * Checks if this is a selling unit.
   */
  isSellingUnit(): boolean {
    return this._category === UnitCategory.SELLING;
  }

  /**
   * Checks if this unit can be converted to another unit.
   * Only measurement units of the same type can be converted.
   */
  canConvertTo(other: Unit): boolean {
    return (
      this.isMeasurementUnit() &&
      other.isMeasurementUnit() &&
      this._type === other._type
    );
  }

  // ======================== UPDATE METHODS ========================

  /**
   * Updates the unit information.
   */
  updateInfo(name: string, symbol: string, type?: UnitType | null): void {
    this._name = name;
    this._symbol = symbol;
    if (type !== undefined && this.isMeasurementUnit()) {
      this._type = type;
    }
    this._updatedAt = new Date();
  }

  /**
   * Activates the unit.
   */
  activate(): void {
    this._isActive = true;
    this._updatedAt = new Date();
  }

  /**
   * Deactivates the unit.
   */
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

  get symbol(): string {
    return this._symbol;
  }

  get category(): UnitCategory {
    return this._category;
  }

  get type(): UnitType | null {
    return this._type;
  }

  get isBase(): boolean {
    return this._isBase;
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

import { v7 as uuidv7 } from 'uuid';
import { ProductOptionValue } from './product-option-value.model';

/**
 * Domain model for ProductOption.
 * Represents an option type like "Size" or "Color" with its values.
 */
export class ProductOption {
  private _values: ProductOptionValue[] = [];

  constructor(
    private readonly _id: string,
    private readonly _productId: string,
    private _name: string,
    private _sortOrder: number,
    private readonly _createdAt: Date,
    values: ProductOptionValue[] = [],
  ) {
    this._values = values;
  }

  // ======================== FACTORY METHODS ========================

  /**
   * Creates a new product option with values.
   */
  static create(
    productId: string,
    name: string,
    values: string[],
    sortOrder: number = 0,
  ): ProductOption {
    const optionId = uuidv7();
    const now = new Date();

    const option = new ProductOption(
      optionId,
      productId,
      name,
      sortOrder,
      now,
      [],
    );

    // Create option values
    const optionValues = values.map((value, index) =>
      ProductOptionValue.create(optionId, value, index),
    );
    option._values = optionValues;

    return option;
  }

  // ======================== UPDATE METHODS ========================

  setValues(values: ProductOptionValue[]): void {
    this._values = values;
  }

  // ======================== GETTERS ========================

  get id(): string {
    return this._id;
  }

  get productId(): string {
    return this._productId;
  }

  get name(): string {
    return this._name;
  }

  get sortOrder(): number {
    return this._sortOrder;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get values(): ProductOptionValue[] {
    return this._values;
  }
}

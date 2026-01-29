import { v7 as uuidv7 } from 'uuid';

/**
 * Domain model for ProductIngredient.
 * Represents a product ingredient.
 */
export class ProductIngredient {
  constructor(
    private readonly _id: string,
    private readonly _productId: string,
    private _name: string,
    private _sortOrder: number,
    private readonly _createdAt: Date,
  ) {}

  // ======================== FACTORY METHODS ========================

  /**
   * Creates a new product ingredient.
   */
  static create(
    productId: string,
    name: string,
    sortOrder: number = 0,
  ): ProductIngredient {
    return new ProductIngredient(
      uuidv7(),
      productId,
      name,
      sortOrder,
      new Date(),
    );
  }

  // ======================== UPDATE METHODS ========================

  updateName(name: string): void {
    this._name = name;
  }

  updateSortOrder(sortOrder: number): void {
    this._sortOrder = sortOrder;
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
}

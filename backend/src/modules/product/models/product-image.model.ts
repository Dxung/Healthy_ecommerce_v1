import { v7 as uuidv7 } from 'uuid';

/**
 * Domain model for ProductImage.
 * Represents a product gallery image.
 */
export class ProductImage {
  constructor(
    private readonly _id: string,
    private readonly _productId: string,
    private _imageUrl: string,
    private _sortOrder: number,
    private readonly _createdAt: Date,
  ) {}

  // ======================== FACTORY METHODS ========================

  /**
   * Creates a new product image.
   */
  static create(
    productId: string,
    imageUrl: string,
    sortOrder: number = 0,
  ): ProductImage {
    return new ProductImage(
      uuidv7(),
      productId,
      imageUrl,
      sortOrder,
      new Date(),
    );
  }

  // ======================== UPDATE METHODS ========================

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

  get imageUrl(): string {
    return this._imageUrl;
  }

  get sortOrder(): number {
    return this._sortOrder;
  }

  get createdAt(): Date {
    return this._createdAt;
  }
}

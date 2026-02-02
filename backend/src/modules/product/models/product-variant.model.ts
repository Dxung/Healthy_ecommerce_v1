import { v7 as uuidv7 } from 'uuid';
import { Result, ok, err } from 'neverthrow';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';

// Error codes for variant operations (will be defined in product.errors.ts)
const VARIANT_ERRORS = {
  INSUFFICIENT_STOCK: {
    code: 'VARIANT_INSUFFICIENT_STOCK',
    message: 'Số lượng tồn kho không đủ.',
  },
  INVALID_PRICE: {
    code: 'VARIANT_INVALID_PRICE',
    message: 'Giá sản phẩm không hợp lệ.',
  },
} as const;

/**
 * Domain model for ProductVariant.
 * Represents a purchasable SKU with price and stock.
 */
export class ProductVariant {
  private _optionValueIds: string[] = [];

  constructor(
    private readonly _id: string,
    private readonly _productId: string,
    private _sku: string | null,
    private _name: string,
    private _price: number,
    private _compareAtPrice: number | null,
    private _stockQuantity: number,
    private _imageUrl: string | null,
    private _sellingUnitId: string | null,
    private _unitQuantity: number | null,
    private _isActive: boolean,
    private _expiryDate: Date | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _deletedAt: Date | null,
    optionValueIds: string[] = [],
  ) {
    this._optionValueIds = optionValueIds;
  }

  // ======================== FACTORY METHODS ========================

  /**
   * Creates a new product variant.
   */
  static create(params: {
    productId: string;
    sku?: string | null;
    name: string;
    price: number;
    compareAtPrice?: number | null;
    stockQuantity: number;
    imageUrl?: string | null;
    sellingUnitId?: string | null;
    unitQuantity?: number | null;
    expiryDate?: Date | null;
    optionValueIds?: string[];
  }): ProductVariant {
    const now = new Date();
    return new ProductVariant(
      uuidv7(),
      params.productId,
      params.sku ?? null,
      params.name,
      params.price,
      params.compareAtPrice ?? null,
      params.stockQuantity,
      params.imageUrl ?? null,
      params.sellingUnitId ?? null,
      params.unitQuantity ?? null,
      true, // isActive
      params.expiryDate ?? null,
      now,
      now,
      null,
      params.optionValueIds ?? [],
    );
  }

  // ======================== BUSINESS RULES ========================

  /**
   * Checks if variant has a discount (compare_at_price > price).
   */
  hasDiscount(): boolean {
    return this._compareAtPrice !== null && this._compareAtPrice > this._price;
  }

  /**
   * Checks if variant is in stock.
   */
  isInStock(): boolean {
    return this._stockQuantity > 0;
  }

  /**
   * Checks if variant can be purchased.
   */
  canBePurchased(): boolean {
    return this._isActive && this.isInStock();
  }

  /**
   * Calculates discount percentage.
   */
  getDiscountPercentage(): number {
    if (!this.hasDiscount() || !this._compareAtPrice) return 0;
    return Math.round(
      ((this._compareAtPrice - this._price) / this._compareAtPrice) * 100,
    );
  }

  // ======================== STOCK MANAGEMENT ========================

  /**
   * Decreases stock by the given quantity.
   */
  decreaseStock(quantity: number): Result<void, DomainError> {
    if (quantity > this._stockQuantity) {
      return err(
        createDomainError(VARIANT_ERRORS.INSUFFICIENT_STOCK, {
          cause: `Requested: ${quantity}, Available: ${this._stockQuantity}`,
        }),
      );
    }
    this._stockQuantity -= quantity;
    this._updatedAt = new Date();
    return ok(undefined);
  }

  /**
   * Increases stock by the given quantity.
   */
  increaseStock(quantity: number): void {
    this._stockQuantity += quantity;
    this._updatedAt = new Date();
  }

  /**
   * Sets the stock quantity directly.
   */
  setStockQuantity(quantity: number): void {
    this._stockQuantity = quantity;
    this._updatedAt = new Date();
  }

  // ======================== UPDATE METHODS ========================

  updateInfo(params: {
    sku?: string | null;
    name?: string;
    imageUrl?: string | null;
    sellingUnitId?: string | null;
    unitQuantity?: number | null;
    expiryDate?: Date | null;
  }): void {
    if (params.sku !== undefined) this._sku = params.sku;
    if (params.name !== undefined) this._name = params.name;
    if (params.imageUrl !== undefined) this._imageUrl = params.imageUrl;
    if (params.sellingUnitId !== undefined)
      this._sellingUnitId = params.sellingUnitId;
    if (params.unitQuantity !== undefined)
      this._unitQuantity = params.unitQuantity;
    if (params.expiryDate !== undefined) this._expiryDate = params.expiryDate;
    this._updatedAt = new Date();
  }

  updatePrice(
    price: number,
    compareAtPrice?: number | null,
  ): Result<void, DomainError> {
    if (price < 0) {
      return err(
        createDomainError(VARIANT_ERRORS.INVALID_PRICE, {
          cause: `Price cannot be negative: ${price}`,
        }),
      );
    }
    this._price = price;
    if (compareAtPrice !== undefined) {
      this._compareAtPrice = compareAtPrice;
    }
    this._updatedAt = new Date();
    return ok(undefined);
  }

  activate(): void {
    this._isActive = true;
    this._updatedAt = new Date();
  }

  deactivate(): void {
    this._isActive = false;
    this._updatedAt = new Date();
  }

  setOptionValueIds(ids: string[]): void {
    this._optionValueIds = ids;
  }

  // ======================== GETTERS ========================

  get id(): string {
    return this._id;
  }

  get productId(): string {
    return this._productId;
  }

  get sku(): string | null {
    return this._sku;
  }

  get name(): string {
    return this._name;
  }

  get price(): number {
    return this._price;
  }

  get compareAtPrice(): number | null {
    return this._compareAtPrice;
  }

  get stockQuantity(): number {
    return this._stockQuantity;
  }

  get imageUrl(): string | null {
    return this._imageUrl;
  }

  get sellingUnitId(): string | null {
    return this._sellingUnitId;
  }

  get unitQuantity(): number | null {
    return this._unitQuantity;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get expiryDate(): Date | null {
    return this._expiryDate;
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

  get optionValueIds(): string[] {
    return this._optionValueIds;
  }
}

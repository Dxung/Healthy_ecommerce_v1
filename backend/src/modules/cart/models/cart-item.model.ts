import { v7 as uuidv7 } from 'uuid';

/**
 * CartItem Domain Model
 * Represents a single item in a shopping cart with variant and quantity
 */
export class CartItem {
  constructor(
    private readonly _id: string,
    private readonly _cartId: string,
    private readonly _shopId: string,
    private readonly _productId: string,
    private readonly _variantId: string,
    private _quantity: number,
    private readonly _priceAtAdded: number,
    private _isSelected: boolean,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  /**
   * Creates a new cart item
   * @param isSelected - Whether the item is selected (default: false)
   */
  static createNew(
    cartId: string,
    shopId: string,
    productId: string,
    variantId: string,
    quantity: number,
    priceAtAdded: number,
    isSelected: boolean = false,
  ): CartItem {
    const now = new Date();
    return new CartItem(
      uuidv7(),
      cartId,
      shopId,
      productId,
      variantId,
      quantity,
      priceAtAdded,
      isSelected,
      now,
      now,
    );
  }

  // ======================== GETTERS ========================

  get id(): string {
    return this._id;
  }

  get cartId(): string {
    return this._cartId;
  }

  get shopId(): string {
    return this._shopId;
  }

  get productId(): string {
    return this._productId;
  }

  get variantId(): string {
    return this._variantId;
  }

  get quantity(): number {
    return this._quantity;
  }

  get priceAtAdded(): number {
    return this._priceAtAdded;
  }

  get isSelected(): boolean {
    return this._isSelected;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // ======================== BUSINESS METHODS ========================

  /**
   * Updates the quantity of this cart item
   */
  updateQuantity(newQuantity: number): void {
    this._quantity = newQuantity;
    this._updatedAt = new Date();
  }

  /**
   * Increases quantity by the given amount
   */
  increaseQuantity(amount: number): void {
    this._quantity += amount;
    this._updatedAt = new Date();
  }

  /**
   * Toggles the selection state
   */
  toggleSelection(): void {
    this._isSelected = !this._isSelected;
    this._updatedAt = new Date();
  }

  /**
   * Selects this item
   */
  select(): void {
    this._isSelected = true;
    this._updatedAt = new Date();
  }

  /**
   * Deselects this item
   */
  deselect(): void {
    this._isSelected = false;
    this._updatedAt = new Date();
  }

  /**
   * Checks if this item belongs to a specific shop
   */
  belongsToShop(shopId: string): boolean {
    return this._shopId === shopId;
  }
}

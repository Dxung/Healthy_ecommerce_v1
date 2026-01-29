import { v7 as uuidv7 } from 'uuid';
import { CartItem } from './cart-item.model';

/**
 * Cart Domain Model
 * Represents a user's shopping cart with items
 */
export class Cart {
  private _items: CartItem[];

  constructor(
    private readonly _id: string,
    private readonly _userId: string,
    private _selectedAddressId: string | null,
    private _note: string | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    items: CartItem[] = [],
  ) {
    this._items = items;
  }

  /**
   * Creates a new cart for a user
   */
  static createNew(userId: string): Cart {
    const now = new Date();
    return new Cart(uuidv7(), userId, null, null, now, now, []);
  }

  // ======================== GETTERS ========================

  get id(): string {
    return this._id;
  }

  get userId(): string {
    return this._userId;
  }

  get selectedAddressId(): string | null {
    return this._selectedAddressId;
  }

  get note(): string | null {
    return this._note;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get items(): CartItem[] {
    return [...this._items];
  }

  // ======================== COMPUTED PROPERTIES ========================

  /**
   * Returns the total number of items in the cart
   */
  get itemCount(): number {
    return this._items.reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * Returns the number of unique items (SKUs) in the cart
   */
  get uniqueItemCount(): number {
    return this._items.length;
  }

  /**
   * Returns selected items only
   */
  get selectedItems(): CartItem[] {
    return this._items.filter((item) => item.isSelected);
  }

  /**
   * Returns the count of selected items
   */
  get selectedItemCount(): number {
    return this.selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * Checks if all items are selected
   */
  get allSelected(): boolean {
    return this._items.length > 0 && this._items.every((item) => item.isSelected);
  }

  /**
   * Checks if the cart is empty
   */
  get isEmpty(): boolean {
    return this._items.length === 0;
  }

  // ======================== BUSINESS METHODS ========================

  /**
   * Sets the selected address for checkout
   */
  setSelectedAddress(addressId: string | null): void {
    this._selectedAddressId = addressId;
    this._updatedAt = new Date();
  }

  /**
   * Sets the note for checkout
   */
  setNote(note: string | null): void {
    this._note = note;
    this._updatedAt = new Date();
  }

  /**
   * Finds an item by its ID
   */
  findItemById(itemId: string): CartItem | undefined {
    return this._items.find((item) => item.id === itemId);
  }

  /**
   * Finds an item by variant ID
   */
  findItemByVariantId(variantId: string): CartItem | undefined {
    return this._items.find((item) => item.variantId === variantId);
  }

  /**
   * Adds an item to the cart (internal use - items should be added via repository)
   */
  addItem(item: CartItem): void {
    this._items.push(item);
    this._updatedAt = new Date();
  }

  /**
   * Removes an item from the cart by ID
   */
  removeItemById(itemId: string): boolean {
    const index = this._items.findIndex((item) => item.id === itemId);
    if (index !== -1) {
      this._items.splice(index, 1);
      this._updatedAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * Removes multiple items by their IDs
   */
  removeItemsByIds(itemIds: string[]): void {
    this._items = this._items.filter((item) => !itemIds.includes(item.id));
    this._updatedAt = new Date();
  }

  /**
   * Gets items grouped by shop ID
   */
  getItemsByShop(): Map<string, CartItem[]> {
    const groupedItems = new Map<string, CartItem[]>();
    for (const item of this._items) {
      const shopItems = groupedItems.get(item.shopId) || [];
      shopItems.push(item);
      groupedItems.set(item.shopId, shopItems);
    }
    return groupedItems;
  }

  /**
   * Gets items for a specific shop
   */
  getShopItems(shopId: string): CartItem[] {
    return this._items.filter((item) => item.shopId === shopId);
  }

  /**
   * Selects all items
   */
  selectAll(): void {
    this._items.forEach((item) => item.select());
    this._updatedAt = new Date();
  }

  /**
   * Deselects all items
   */
  deselectAll(): void {
    this._items.forEach((item) => item.deselect());
    this._updatedAt = new Date();
  }

  /**
   * Selects all items from a specific shop
   */
  selectShopItems(shopId: string): void {
    this._items
      .filter((item) => item.shopId === shopId)
      .forEach((item) => item.select());
    this._updatedAt = new Date();
  }

  /**
   * Deselects all items from a specific shop
   */
  deselectShopItems(shopId: string): void {
    this._items
      .filter((item) => item.shopId === shopId)
      .forEach((item) => item.deselect());
    this._updatedAt = new Date();
  }

  /**
   * Clears all items from the cart
   */
  clear(): void {
    this._items = [];
    this._updatedAt = new Date();
  }

  /**
   * Gets the 5 most recently added items (for preview)
   */
  getPreviewItems(limit: number = 5): CartItem[] {
    return [...this._items]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  /**
   * Sets the items array (used by mapper)
   */
  setItems(items: CartItem[]): void {
    this._items = items;
  }
}

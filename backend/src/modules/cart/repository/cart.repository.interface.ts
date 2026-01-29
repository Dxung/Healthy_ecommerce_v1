import type { ResultAsync } from 'neverthrow';
import type { DomainError } from 'src/shared/types/domain-error.type';
import type { Cart } from '../models/cart.model';
import type { CartItem } from '../models/cart-item.model';

/**
 * Cart item with full variant and product information for display
 */
export interface CartItemWithDetails {
  cartItem: CartItem;
  variant: {
    id: string;
    name: string;
    price: number;
    compareAtPrice: number | null;
    imageUrl: string | null;
    stockQuantity: number;
    isActive: boolean;
    sku: string | null;
  };
  product: {
    id: string;
    name: string;
    slug: string;
    thumbnailUrl: string;
    isVisible: boolean;
    status: string;
  };
  shop: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  };
  /** Whether the price has changed since item was added */
  hasPriceChanged: boolean;
}

export interface ICartRepository {
  /**
   * Find cart by user ID (without items)
   */
  findByUserId(userId: string): ResultAsync<Cart | null, DomainError>;

  /**
   * Find or create cart for user
   */
  findOrCreateByUserId(userId: string): ResultAsync<Cart, DomainError>;

  /**
   * Find cart with all items
   */
  findCartWithItems(userId: string): ResultAsync<Cart | null, DomainError>;

  /**
   * Find cart items with full variant, product, and shop details
   */
  findCartItemsWithDetails(
    cartId: string,
  ): ResultAsync<CartItemWithDetails[], DomainError>;

  /**
   * Find cart item by ID
   */
  findCartItemById(
    cartItemId: string,
  ): ResultAsync<CartItem | null, DomainError>;

  /**
   * Find cart item by cart ID and variant ID
   */
  findCartItemByVariantId(
    cartId: string,
    variantId: string,
  ): ResultAsync<CartItem | null, DomainError>;

  /**
   * Add item to cart
   */
  addItem(cartItem: CartItem): ResultAsync<CartItem, DomainError>;

  /**
   * Update cart item
   */
  updateItem(cartItem: CartItem): ResultAsync<CartItem, DomainError>;

  /**
   * Remove item from cart
   */
  removeItem(cartItemId: string): ResultAsync<void, DomainError>;

  /**
   * Remove multiple items from cart
   */
  removeItems(cartItemIds: string[]): ResultAsync<void, DomainError>;

  /**
   * Update cart (timestamp only)
   */
  updateCart(cart: Cart): ResultAsync<Cart, DomainError>;

  /**
   * Clear all items from cart
   */
  clearCart(cartId: string): ResultAsync<void, DomainError>;

  /**
   * Update selection status for multiple items
   */
  updateItemsSelection(
    cartItemIds: string[],
    isSelected: boolean,
  ): ResultAsync<void, DomainError>;

  /**
   * Update selection status for all items of a specific shop
   */
  updateShopItemsSelection(
    cartId: string,
    shopId: string,
    isSelected: boolean,
  ): ResultAsync<void, DomainError>;

  /**
   * Update selection status for all items in cart
   */
  updateAllItemsSelection(
    cartId: string,
    isSelected: boolean,
  ): ResultAsync<void, DomainError>;

  /**
   * Get cart item IDs that are inactive (product deleted/hidden, variant inactive, or out of stock)
   */
  findInactiveItemIds(cartId: string): ResultAsync<string[], DomainError>;

  /**
   * Get count of items in cart
   */
  getItemCount(cartId: string): ResultAsync<number, DomainError>;

  /**
   * Get N most recent cart items with details (for preview)
   */
  findRecentItemsWithDetails(
    cartId: string,
    limit: number,
  ): ResultAsync<CartItemWithDetails[], DomainError>;
}

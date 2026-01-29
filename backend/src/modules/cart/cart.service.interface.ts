import type { ResultAsync } from 'neverthrow';
import type { DomainError } from 'src/shared/types/domain-error.type';
import type { CartItemWithDetails } from './repository/cart.repository.interface';

export interface CartFullResponse {
  cartId: string;
  itemsWithDetails: CartItemWithDetails[];
}

export interface CartPreviewData {
  recentItems: CartItemWithDetails[];
  totalItems: number;
  totalQuantity: number;
}

export interface CheckoutPreviewData {
  selectedItems: CartItemWithDetails[];
  hasInactiveItems: boolean;
}

export interface ICartService {
  /**
   * Get full cart with items grouped by shop
   */
  getMyCart(): ResultAsync<CartFullResponse, DomainError>;

  /**
   * Get cart preview (5 newest items for header dropdown)
   */
  getCartPreview(): ResultAsync<CartPreviewData, DomainError>;

  /**
   * Add item to cart (creates cart if not exists)
   */
  addToCart(
    variantId: string,
    quantity: number,
  ): ResultAsync<void, DomainError>;

  /**
   * Update cart item quantity
   */
  updateItemQuantity(
    cartItemId: string,
    quantity: number,
  ): ResultAsync<void, DomainError>;

  /**
   * Remove single item from cart
   */
  removeItem(cartItemId: string): ResultAsync<void, DomainError>;

  /**
   * Remove multiple items from cart
   */
  removeItems(cartItemIds: string[]): ResultAsync<void, DomainError>;

  /**
   * Remove inactive items (deleted/hidden/out-of-stock)
   */
  removeInactiveItems(): ResultAsync<{ removedCount: number }, DomainError>;

  /**
   * Toggle single item selection
   */
  toggleItemSelection(cartItemId: string): ResultAsync<void, DomainError>;

  /**
   * Select all items in cart
   */
  selectAllItems(): ResultAsync<void, DomainError>;

  /**
   * Deselect all items in cart
   */
  deselectAllItems(): ResultAsync<void, DomainError>;

  /**
   * Select all items from a specific shop
   */
  selectShopItems(shopId: string): ResultAsync<void, DomainError>;

  /**
   * Deselect all items from a specific shop
   */
  deselectShopItems(shopId: string): ResultAsync<void, DomainError>;

  /**
   * Get selected items for checkout preview
   */
  prepareCheckout(): ResultAsync<CheckoutPreviewData, DomainError>;
}

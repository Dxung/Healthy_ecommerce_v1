import type { CartItemWithDetails } from '../repository/cart.repository.interface';
import { CartShopGroupResponseDto } from './cart-shop-group-response.dto';

export class CartResponseDto {
  cartId: string;
  shops: CartShopGroupResponseDto[];
  totalItems: number;
  totalQuantity: number;
  selectedTotal: number;
  hasInactiveItems: boolean;
  hasPriceChangedItems: boolean;

  constructor(cartId: string, itemsWithDetails: CartItemWithDetails[]) {
    this.cartId = cartId;
    this.totalItems = itemsWithDetails.length;
    this.totalQuantity = itemsWithDetails.reduce(
      (sum, item) => sum + item.cartItem.quantity,
      0,
    );

    // Group items by shop
    const shopGroups = new Map<
      string,
      {
        shop: { id: string; name: string; slug: string; logoUrl: string | null };
        items: CartItemWithDetails[];
      }
    >();

    for (const item of itemsWithDetails) {
      const existing = shopGroups.get(item.shop.id);
      if (existing) {
        existing.items.push(item);
      } else {
        shopGroups.set(item.shop.id, {
          shop: item.shop,
          items: [item],
        });
      }
    }

    this.shops = Array.from(shopGroups.values()).map(
      ({ shop, items }) => new CartShopGroupResponseDto(shop, items),
    );

    // Calculate selected total
    const selectedItems = itemsWithDetails.filter(
      (item) => item.cartItem.isSelected,
    );
    this.selectedTotal = selectedItems.reduce(
      (sum, item) => sum + item.variant.price * item.cartItem.quantity,
      0,
    );

    // Check for inactive items (variant inactive, product hidden/deleted, or out of stock)
    this.hasInactiveItems = itemsWithDetails.some(
      (item) =>
        !item.variant.isActive ||
        !item.product.isVisible ||
        item.product.status !== 'active' ||
        item.variant.stockQuantity === 0,
    );

    // Check for price changed items
    this.hasPriceChangedItems = itemsWithDetails.some(
      (item) => item.hasPriceChanged,
    );
  }
}

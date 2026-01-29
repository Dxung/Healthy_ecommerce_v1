import type { CartItemWithDetails } from '../repository/cart.repository.interface';
import { CartShopGroupResponseDto } from './cart-shop-group-response.dto';

export class CartResponseDto {
  id: string;
  itemCount: number;
  uniqueItemCount: number;
  selectedItemCount: number;
  allSelected: boolean;
  shops: CartShopGroupResponseDto[];
  subtotal: number;
  selectedSubtotal: number;

  constructor(
    cartId: string,
    itemsWithDetails: CartItemWithDetails[],
  ) {
    this.id = cartId;
    this.uniqueItemCount = itemsWithDetails.length;
    this.itemCount = itemsWithDetails.reduce(
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

    // Calculate selected items
    const selectedItems = itemsWithDetails.filter(
      (item) => item.cartItem.isSelected,
    );
    this.selectedItemCount = selectedItems.reduce(
      (sum, item) => sum + item.cartItem.quantity,
      0,
    );
    this.allSelected =
      itemsWithDetails.length > 0 &&
      itemsWithDetails.every((item) => item.cartItem.isSelected);

    // Calculate subtotals
    this.subtotal = itemsWithDetails.reduce(
      (sum, item) => sum + item.variant.price * item.cartItem.quantity,
      0,
    );
    this.selectedSubtotal = selectedItems.reduce(
      (sum, item) => sum + item.variant.price * item.cartItem.quantity,
      0,
    );
  }
}

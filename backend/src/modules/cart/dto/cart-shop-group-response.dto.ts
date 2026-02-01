import type { CartItemWithDetails } from '../repository/cart.repository.interface';
import { CartItemResponseDto } from './cart-item-response.dto';

export class CartShopGroupResponseDto {
  shop: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  };
  items: CartItemResponseDto[];
  shopSubtotal: number;
  selectedCount: number;

  constructor(
    shop: { id: string; name: string; slug: string; logoUrl: string | null },
    items: CartItemWithDetails[],
  ) {
    this.shop = shop;
    this.items = items.map((item) => new CartItemResponseDto(item));

    // Calculate subtotal for selected items in this shop
    const selectedItems = items.filter((item) => item.cartItem.isSelected);
    this.shopSubtotal = selectedItems.reduce(
      (sum, item) => sum + item.variant.price * item.cartItem.quantity,
      0,
    );
    this.selectedCount = selectedItems.length;
  }
}

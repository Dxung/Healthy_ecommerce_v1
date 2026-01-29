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
  subtotal: number;
  allSelected: boolean;

  constructor(
    shop: { id: string; name: string; slug: string; logoUrl: string | null },
    items: CartItemWithDetails[],
  ) {
    this.shop = shop;
    this.items = items.map((item) => new CartItemResponseDto(item));
    this.subtotal = items.reduce(
      (sum, item) => sum + item.variant.price * item.cartItem.quantity,
      0,
    );
    this.allSelected =
      items.length > 0 && items.every((item) => item.cartItem.isSelected);
  }
}

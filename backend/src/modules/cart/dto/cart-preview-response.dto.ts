import type { CartItemWithDetails } from '../repository/cart.repository.interface';
import { CartItemResponseDto } from './cart-item-response.dto';

export class CartPreviewResponseDto {
  recentItems: CartItemResponseDto[];
  totalItems: number;
  totalQuantity: number;

  constructor(
    itemsWithDetails: CartItemWithDetails[],
    totalItems: number,
    totalQuantity: number,
  ) {
    this.recentItems = itemsWithDetails.map(
      (item) => new CartItemResponseDto(item),
    );
    this.totalItems = totalItems;
    this.totalQuantity = totalQuantity;
  }
}

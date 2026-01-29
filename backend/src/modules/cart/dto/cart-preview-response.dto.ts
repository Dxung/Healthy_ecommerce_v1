import type { CartItemWithDetails } from '../repository/cart.repository.interface';

export class CartPreviewItemDto {
  id: string;
  productName: string;
  variantName: string;
  imageUrl: string;
  price: number;
  quantity: number;

  constructor(item: CartItemWithDetails) {
    this.id = item.cartItem.id;
    this.productName = item.product.name;
    this.variantName = item.variant.name;
    this.imageUrl = item.variant.imageUrl || item.product.thumbnailUrl;
    this.price = item.variant.price;
    this.quantity = item.cartItem.quantity;
  }
}

export class CartPreviewResponseDto {
  items: CartPreviewItemDto[];
  totalItems: number;
  totalQuantity: number;

  constructor(
    itemsWithDetails: CartItemWithDetails[],
    totalItems: number,
    totalQuantity: number,
  ) {
    this.items = itemsWithDetails.map((item) => new CartPreviewItemDto(item));
    this.totalItems = totalItems;
    this.totalQuantity = totalQuantity;
  }
}

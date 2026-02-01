import type { CartItemWithDetails } from '../repository/cart.repository.interface';

export class CartItemResponseDto {
  id: string;
  variantId: string;
  productId: string;
  shopId: string;
  quantity: number;
  isSelected: boolean;
  priceAtAdded: number;
  hasPriceChanged: boolean;
  createdAt: Date;
  updatedAt: Date;

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

  constructor(item: CartItemWithDetails) {
    this.id = item.cartItem.id;
    this.variantId = item.cartItem.variantId;
    this.productId = item.cartItem.productId;
    this.shopId = item.shop.id;
    this.quantity = item.cartItem.quantity;
    this.isSelected = item.cartItem.isSelected;
    this.priceAtAdded = item.cartItem.priceAtAdded;
    this.hasPriceChanged = item.hasPriceChanged;
    this.createdAt = item.cartItem.createdAt;
    this.updatedAt = item.cartItem.updatedAt;
    this.variant = item.variant;
    this.product = item.product;
    this.shop = item.shop;
  }
}

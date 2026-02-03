import type { CartItemWithDetails } from '../repository/cart.repository.interface';
import { CartShopGroupResponseDto } from './cart-shop-group-response.dto';

export class CheckoutPreparationResponseDto {
  shops: CartShopGroupResponseDto[];
  totalItems: number;
  totalQuantity: number;
  subtotal: number;
  hasInactiveItems: boolean;
  hasPriceChangedItems: boolean;
  shippingFeeDefault: number;
  shippingFreeThreshold: number;
  totalShippingFee: number;

  constructor(
    selectedItems: CartItemWithDetails[],
    hasInactiveItems: boolean,
    shippingFeeDefault: number,
    shippingFreeThreshold: number,
  ) {
    // Group items by shop
    const shopGroups = new Map<
      string,
      {
        shop: {
          id: string;
          name: string;
          slug: string;
          logoUrl: string | null;
        };
        items: CartItemWithDetails[];
      }
    >();

    for (const item of selectedItems) {
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
      ({ shop, items }) =>
        new CartShopGroupResponseDto(
          shop,
          items,
          shippingFeeDefault,
          shippingFreeThreshold,
        ),
    );

    this.totalItems = selectedItems.length;
    this.totalQuantity = selectedItems.reduce(
      (sum, item) => sum + item.cartItem.quantity,
      0,
    );
    this.subtotal = selectedItems.reduce(
      (sum, item) => sum + item.variant.price * item.cartItem.quantity,
      0,
    );
    this.hasInactiveItems = hasInactiveItems;
    this.hasPriceChangedItems = selectedItems.some(
      (item) => item.hasPriceChanged,
    );

    // Shipping config
    this.shippingFeeDefault = shippingFeeDefault;
    this.shippingFreeThreshold = shippingFreeThreshold;

    // Calculate total shipping fee from all shops
    this.totalShippingFee = this.shops.reduce(
      (sum, shop) => sum + shop.shippingFee,
      0,
    );
  }
}

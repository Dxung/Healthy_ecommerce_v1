import type { OrderItem } from '../models/order-item.model';

export class OrderItemResponseDto {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  productImageUrl: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;

  constructor(item: OrderItem) {
    this.id = item.id;
    this.productId = item.productId;
    this.variantId = item.variantId;
    this.productName = item.productName;
    this.variantName = item.variantName;
    this.productImageUrl = item.productImageUrl;
    this.unitPrice = item.unitPrice;
    this.quantity = item.quantity;
    this.totalPrice = item.totalPrice;
  }

  static fromList(items: OrderItem[]): OrderItemResponseDto[] {
    return items.map((item) => new OrderItemResponseDto(item));
  }
}

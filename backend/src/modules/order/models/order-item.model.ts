import { v7 as uuidv7 } from 'uuid';

/**
 * OrderItem Domain Model
 * Represents a single product item in an order with snapshotted info.
 */
export class OrderItem {
  constructor(
    private readonly _id: string,
    private readonly _orderId: string,
    private readonly _productId: string,
    private readonly _variantId: string,
    private readonly _productName: string,
    private readonly _variantName: string,
    private readonly _productImageUrl: string,
    private readonly _unitPrice: number,
    private readonly _quantity: number,
    private readonly _totalPrice: number,
    private readonly _createdAt: Date,
  ) {}

  /**
   * Creates a new order item with snapshotted product info
   */
  static create(params: {
    orderId: string;
    productId: string;
    variantId: string;
    productName: string;
    variantName: string;
    productImageUrl: string;
    unitPrice: number;
    quantity: number;
  }): OrderItem {
    const totalPrice = params.unitPrice * params.quantity;
    return new OrderItem(
      uuidv7(),
      params.orderId,
      params.productId,
      params.variantId,
      params.productName,
      params.variantName,
      params.productImageUrl,
      params.unitPrice,
      params.quantity,
      totalPrice,
      new Date(),
    );
  }

  // ======================== GETTERS ========================

  get id(): string {
    return this._id;
  }

  get orderId(): string {
    return this._orderId;
  }

  get productId(): string {
    return this._productId;
  }

  get variantId(): string {
    return this._variantId;
  }

  get productName(): string {
    return this._productName;
  }

  get variantName(): string {
    return this._variantName;
  }

  get productImageUrl(): string {
    return this._productImageUrl;
  }

  get unitPrice(): number {
    return this._unitPrice;
  }

  get quantity(): number {
    return this._quantity;
  }

  get totalPrice(): number {
    return this._totalPrice;
  }

  get createdAt(): Date {
    return this._createdAt;
  }
}

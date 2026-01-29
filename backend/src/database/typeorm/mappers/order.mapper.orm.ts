import { ORMOrder } from '../entities/order/orm.order.entity';
import { ORMOrderItem } from '../entities/order/orm.order-item.entity';
import { Order } from 'src/modules/order/models/order.model';
import { OrderItem } from 'src/modules/order/models/order-item.model';

/**
 * Mapper for converting between ORM entities and domain models for Order
 */
export class ORMOrderMapper {
  /**
   * Convert ORM Order entity to Order domain model
   */
  static toDomain(ormOrder: ORMOrder): Order {
    const items = ormOrder.items
      ? ormOrder.items.map((item) => ORMOrderMapper.orderItemToDomain(item))
      : [];

    return new Order(
      ormOrder.id,
      ormOrder.orderCode,
      ormOrder.buyerId,
      ormOrder.shopId,
      ormOrder.receiverName,
      ormOrder.receiverPhone,
      ormOrder.shippingAddress,
      ormOrder.shippingWardId,
      ormOrder.shippingDistrictId,
      ormOrder.shippingProvinceId,
      Number(ormOrder.subtotal),
      Number(ormOrder.shippingFee),
      Number(ormOrder.platformFee),
      Number(ormOrder.platformFeePercent),
      Number(ormOrder.tierDiscountAmount),
      Number(ormOrder.tierDiscountPercent),
      Number(ormOrder.voucherDiscountAmount),
      Number(ormOrder.coinUsed),
      Number(ormOrder.totalAmount),
      ormOrder.buyerTierCode,
      Number(ormOrder.coinMultiplier),
      Number(ormOrder.coinEarned),
      ormOrder.paymentMethod,
      ormOrder.paymentStatus,
      ormOrder.paidAt,
      ormOrder.status,
      ormOrder.confirmedAt,
      ormOrder.shippedAt,
      ormOrder.deliveredAt,
      ormOrder.completedAt,
      ormOrder.cancelledAt,
      ormOrder.cancelReason,
      ormOrder.cancelledBy,
      ormOrder.buyerNote,
      ormOrder.shopNote,
      ormOrder.createdAt,
      ormOrder.updatedAt,
      items,
    );
  }

  /**
   * Convert Order domain model to ORM entity
   */
  static toOrm(domainOrder: Order): ORMOrder {
    const ormOrder = new ORMOrder();
    ormOrder.id = domainOrder.id;
    ormOrder.orderCode = domainOrder.orderCode;
    ormOrder.buyerId = domainOrder.buyerId;
    ormOrder.shopId = domainOrder.shopId;
    ormOrder.receiverName = domainOrder.receiverName;
    ormOrder.receiverPhone = domainOrder.receiverPhone;
    ormOrder.shippingAddress = domainOrder.shippingAddress;
    ormOrder.shippingWardId = domainOrder.shippingWardId;
    ormOrder.shippingDistrictId = domainOrder.shippingDistrictId;
    ormOrder.shippingProvinceId = domainOrder.shippingProvinceId;
    ormOrder.subtotal = domainOrder.subtotal;
    ormOrder.shippingFee = domainOrder.shippingFee;
    ormOrder.platformFee = domainOrder.platformFee;
    ormOrder.platformFeePercent = domainOrder.platformFeePercent;
    ormOrder.tierDiscountAmount = domainOrder.tierDiscountAmount;
    ormOrder.tierDiscountPercent = domainOrder.tierDiscountPercent;
    ormOrder.voucherDiscountAmount = domainOrder.voucherDiscountAmount;
    ormOrder.coinUsed = domainOrder.coinUsed;
    ormOrder.totalAmount = domainOrder.totalAmount;
    ormOrder.buyerTierCode = domainOrder.buyerTierCode;
    ormOrder.coinMultiplier = domainOrder.coinMultiplier;
    ormOrder.coinEarned = domainOrder.coinEarned;
    ormOrder.paymentMethod = domainOrder.paymentMethod;
    ormOrder.paymentStatus = domainOrder.paymentStatus;
    ormOrder.paidAt = domainOrder.paidAt;
    ormOrder.status = domainOrder.status;
    ormOrder.confirmedAt = domainOrder.confirmedAt;
    ormOrder.shippedAt = domainOrder.shippedAt;
    ormOrder.deliveredAt = domainOrder.deliveredAt;
    ormOrder.completedAt = domainOrder.completedAt;
    ormOrder.cancelledAt = domainOrder.cancelledAt;
    ormOrder.cancelReason = domainOrder.cancelReason;
    ormOrder.cancelledBy = domainOrder.cancelledBy;
    ormOrder.buyerNote = domainOrder.buyerNote;
    ormOrder.shopNote = domainOrder.shopNote;
    ormOrder.createdAt = domainOrder.createdAt;
    ormOrder.updatedAt = domainOrder.updatedAt;
    return ormOrder;
  }

  /**
   * Convert ORM OrderItem entity to OrderItem domain model
   */
  static orderItemToDomain(ormOrderItem: ORMOrderItem): OrderItem {
    return new OrderItem(
      ormOrderItem.id,
      ormOrderItem.orderId,
      ormOrderItem.productId,
      ormOrderItem.variantId,
      ormOrderItem.productName,
      ormOrderItem.variantName,
      ormOrderItem.productImageUrl,
      Number(ormOrderItem.unitPrice),
      ormOrderItem.quantity,
      Number(ormOrderItem.totalPrice),
      ormOrderItem.createdAt,
      ormOrderItem.refundStatus,
      ormOrderItem.refundedAt,
      ormOrderItem.refundReason,
    );
  }

  /**
   * Convert OrderItem domain model to ORM entity
   */
  static orderItemToOrm(domainOrderItem: OrderItem): ORMOrderItem {
    const ormOrderItem = new ORMOrderItem();
    ormOrderItem.id = domainOrderItem.id;
    ormOrderItem.orderId = domainOrderItem.orderId;
    ormOrderItem.productId = domainOrderItem.productId;
    ormOrderItem.variantId = domainOrderItem.variantId;
    ormOrderItem.productName = domainOrderItem.productName;
    ormOrderItem.variantName = domainOrderItem.variantName;
    ormOrderItem.productImageUrl = domainOrderItem.productImageUrl;
    ormOrderItem.unitPrice = domainOrderItem.unitPrice;
    ormOrderItem.quantity = domainOrderItem.quantity;
    ormOrderItem.totalPrice = domainOrderItem.totalPrice;
    ormOrderItem.createdAt = domainOrderItem.createdAt;
    ormOrderItem.refundStatus = domainOrderItem.refundStatus;
    ormOrderItem.refundedAt = domainOrderItem.refundedAt;
    ormOrderItem.refundReason = domainOrderItem.refundReason;
    return ormOrderItem;
  }

  /**
   * Convert array of ORM Order entities to array of domain models
   */
  static toDomainList(ormOrders: ORMOrder[]): Order[] {
    return ormOrders.map((order) => ORMOrderMapper.toDomain(order));
  }

  /**
   * Convert array of ORM OrderItem entities to array of domain models
   */
  static orderItemsToDomainList(ormOrderItems: ORMOrderItem[]): OrderItem[] {
    return ormOrderItems.map((item) => ORMOrderMapper.orderItemToDomain(item));
  }
}

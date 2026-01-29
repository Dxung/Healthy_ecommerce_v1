import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ORMOrder } from './orm.order.entity';
import { ORMProduct } from '../product';
import { ORMProductVariant } from '../product';

/**
 * ORM Entity for order_items table.
 * Represents a product in an order with snapshotted info.
 */
@Entity('order_items', { schema: 'order_schema' })
@Index('idx_order_items_order_id', ['orderId'])
@Index('idx_order_items_product_id', ['productId'])
export class ORMOrderItem {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @Column({ name: 'variant_id', type: 'uuid' })
  variantId: string;

  /** Snapshotted product name at order time */
  @Column({ name: 'product_name', type: 'varchar', length: 500 })
  productName: string;

  /** Snapshotted variant name at order time */
  @Column({ name: 'variant_name', type: 'varchar', length: 255 })
  variantName: string;

  /** Snapshotted product image at order time */
  @Column({ name: 'product_image_url', type: 'varchar', length: 500 })
  productImageUrl: string;

  /** Price per unit at order time */
  @Column({ name: 'unit_price', type: 'decimal', precision: 15, scale: 2 })
  unitPrice: number;

  @Column({ name: 'quantity', type: 'integer' })
  quantity: number;

  /** total_price = unit_price * quantity */
  @Column({ name: 'total_price', type: 'decimal', precision: 15, scale: 2 })
  totalPrice: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  // ======================== RELATIONSHIPS ========================

  /** Order this item belongs to */
  @ManyToOne(() => ORMOrder, (order) => order.items)
  @JoinColumn({ name: 'order_id' })
  order: ORMOrder;

  /** Product reference (may be deleted) */
  @ManyToOne(() => ORMProduct)
  @JoinColumn({ name: 'product_id' })
  product: ORMProduct;

  /** Variant reference (may be deleted) */
  @ManyToOne(() => ORMProductVariant)
  @JoinColumn({ name: 'variant_id' })
  variant: ORMProductVariant;
}

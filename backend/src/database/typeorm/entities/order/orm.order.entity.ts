import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { ORMUserCore } from '../user';
import { ORMShop } from '../shop';
import { ORMOrderItem } from './orm.order-item.entity';
import { OrderStatus } from './enums/order-status.enum';
import { PaymentStatus } from './enums/payment-status.enum';
import { PaymentMethod } from './enums/payment-method.enum';
import { CancelledBy } from './enums/cancelled-by.enum';

/**
 * ORM Entity for orders table.
 * Represents an order placed by a buyer to a shop.
 */
@Entity('orders', { schema: 'order_schema' })
@Index('idx_orders_order_code', ['orderCode'])
@Index('idx_orders_buyer_id', ['buyerId'])
@Index('idx_orders_shop_id', ['shopId'])
@Index('idx_orders_status', ['status'])
@Index('idx_orders_created_at', ['createdAt'])
export class ORMOrder {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'order_code', type: 'varchar', length: 50, unique: true })
  orderCode: string;

  @Column({ name: 'buyer_id', type: 'uuid' })
  buyerId: string;

  @Column({ name: 'shop_id', type: 'uuid' })
  shopId: string;

  @Column({ name: 'receiver_name', type: 'varchar', length: 255 })
  receiverName: string;

  @Column({ name: 'receiver_phone', type: 'varchar', length: 20 })
  receiverPhone: string;

  @Column({ name: 'shipping_address', type: 'text' })
  shippingAddress: string;

  @Column({ name: 'shipping_ward_id', type: 'varchar', length: 50, nullable: true })
  shippingWardId: string | null;

  @Column({ name: 'shipping_district_id', type: 'varchar', length: 50, nullable: true })
  shippingDistrictId: string | null;

  @Column({ name: 'shipping_province_id', type: 'varchar', length: 50, nullable: true })
  shippingProvinceId: string | null;

  @Column({ name: 'subtotal', type: 'decimal', precision: 15, scale: 2 })
  subtotal: number;

  @Column({ name: 'shipping_fee', type: 'decimal', precision: 15, scale: 2, default: 0 })
  shippingFee: number;

  @Column({ name: 'platform_fee', type: 'decimal', precision: 15, scale: 2, default: 0 })
  platformFee: number;

  @Column({ name: 'platform_fee_percent', type: 'decimal', precision: 5, scale: 2 })
  platformFeePercent: number;

  @Column({ name: 'tier_discount_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  tierDiscountAmount: number;

  @Column({ name: 'tier_discount_percent', type: 'decimal', precision: 5, scale: 2, default: 0 })
  tierDiscountPercent: number;

  @Column({ name: 'voucher_discount_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  voucherDiscountAmount: number;

  @Column({ name: 'coin_used', type: 'bigint', default: 0 })
  coinUsed: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 15, scale: 2 })
  totalAmount: number;

  @Column({ name: 'buyer_tier_code', type: 'varchar', length: 20 })
  buyerTierCode: string;

  @Column({ name: 'coin_multiplier', type: 'decimal', precision: 3, scale: 2 })
  coinMultiplier: number;

  @Column({ name: 'coin_earned', type: 'bigint', default: 0 })
  coinEarned: number;

  @Column({
    name: 'payment_method',
    type: 'enum',
    enum: PaymentMethod,
    enumName: 'payment_method_enum',
  })
  paymentMethod: PaymentMethod;

  @Column({
    name: 'payment_status',
    type: 'enum',
    enum: PaymentStatus,
    enumName: 'payment_status_enum',
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
  paidAt: Date | null;

  @Column({
    name: 'status',
    type: 'enum',
    enum: OrderStatus,
    enumName: 'order_status_enum',
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({ name: 'confirmed_at', type: 'timestamp', nullable: true })
  confirmedAt: Date | null;

  @Column({ name: 'shipped_at', type: 'timestamp', nullable: true })
  shippedAt: Date | null;

  @Column({ name: 'delivered_at', type: 'timestamp', nullable: true })
  deliveredAt: Date | null;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @Column({ name: 'cancelled_at', type: 'timestamp', nullable: true })
  cancelledAt: Date | null;

  @Column({ name: 'cancel_reason', type: 'text', nullable: true })
  cancelReason: string | null;

  @Column({
    name: 'cancelled_by',
    type: 'enum',
    enum: CancelledBy,
    enumName: 'cancelled_by_enum',
    nullable: true,
  })
  cancelledBy: CancelledBy | null;

  @Column({ name: 'buyer_note', type: 'text', nullable: true })
  buyerNote: string | null;

  @Column({ name: 'shop_note', type: 'text', nullable: true })
  shopNote: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  // ======================== RELATIONSHIPS ========================

  /** Buyer who placed this order */
  @ManyToOne(() => ORMUserCore)
  @JoinColumn({ name: 'buyer_id' })
  buyer: ORMUserCore;

  /** Shop that receives this order */
  @ManyToOne(() => ORMShop)
  @JoinColumn({ name: 'shop_id' })
  shop: ORMShop;

  /** Items in this order */
  @OneToMany(() => ORMOrderItem, (item) => item.order)
  items: ORMOrderItem[];
}

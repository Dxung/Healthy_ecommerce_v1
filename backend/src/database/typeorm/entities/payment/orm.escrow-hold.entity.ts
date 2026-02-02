import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { EscrowStatus } from './enums/escrow-status.enum';

/**
 * ORM Entity for escrow_holds table.
 * Represents money held during order processing.
 */
@Entity('escrow_holds', { schema: 'payment_schema' })
@Index('idx_escrow_holds_order_id', ['orderId'])
@Index('idx_escrow_holds_shop_id', ['shopId'])
@Index('idx_escrow_holds_status', ['status'])
export class ORMEscrowHold {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  @Column({ name: 'shop_id', type: 'uuid' })
  shopId: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  /** Order subtotal (original value before coin discount) - used to calculate platform fee */
  @Column({ name: 'order_subtotal', type: 'decimal', precision: 15, scale: 2 })
  orderSubtotal: number;

  /** Coins used by buyer in this order */
  @Column({
    name: 'coin_used',
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
  })
  coinUsed: number;

  /** Platform fee percent at order creation time (already includes badge discount) */
  @Column({
    name: 'platform_fee_percent',
    type: 'decimal',
    precision: 5,
    scale: 2,
  })
  platformFeePercent: number;

  @Column({
    type: 'enum',
    enum: EscrowStatus,
    enumName: 'escrow_status_enum',
    default: EscrowStatus.HOLDING,
  })
  status: EscrowStatus;

  @Column({ name: 'released_at', type: 'timestamp', nullable: true })
  releasedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

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
import { ORMUserAddress } from '../user/orm.user-address.entity';
import { ORMCartItem } from './orm.cart-item.entity';

/**
 * ORM Entity for carts table.
 * Represents a user's shopping cart.
 */
@Entity('carts', { schema: 'cart_schema' })
@Index('idx_carts_user_id', ['userId'], { unique: true })
export class ORMCart {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  /** Checkout state - save temp to resume checkout */
  @Column({ name: 'selected_address_id', type: 'uuid', nullable: true })
  selectedAddressId: string | null;

  @Column({ name: 'note', type: 'text', nullable: true })
  note: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  // ======================== RELATIONSHIPS ========================

  /** User who owns this cart */
  @ManyToOne(() => ORMUserCore, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: ORMUserCore;

  /** Selected shipping address for checkout */
  @ManyToOne(() => ORMUserAddress)
  @JoinColumn({ name: 'selected_address_id' })
  selectedAddress: ORMUserAddress | null;

  /** Items in this cart */
  @OneToMany(() => ORMCartItem, (item) => item.cart)
  items: ORMCartItem[];
}

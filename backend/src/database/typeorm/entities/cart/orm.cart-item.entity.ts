import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
  Check,
} from 'typeorm';
import { ORMCart } from './orm.cart.entity';
import { ORMProductVariant, ORMProduct } from '../product';
import { ORMShop } from '../shop';

/**
 * ORM Entity for cart_items table.
 * Represents a single item in a user's shopping cart.
 */
@Entity('cart_items', { schema: 'cart_schema' })
@Index('idx_cart_items_cart_id', ['cartId'])
@Index('idx_cart_items_shop_id', ['shopId'])
@Index('idx_cart_items_product_id', ['productId'])
@Unique('uq_cart_variant', ['cartId', 'variantId'])
@Check('chk_quantity', '"quantity" > 0')
export class ORMCartItem {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'cart_id', type: 'uuid' })
  cartId: string;

  @Column({ name: 'shop_id', type: 'uuid' })
  shopId: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @Column({ name: 'variant_id', type: 'uuid' })
  variantId: string;

  @Column({ name: 'quantity', type: 'integer', default: 1 })
  quantity: number;

  /** Snapshot price at add time to detect changes */
  @Column({ name: 'price_at_added', type: 'decimal', precision: 15, scale: 2 })
  priceAtAdded: number;

  @Column({ name: 'is_selected', type: 'boolean', default: true })
  isSelected: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  // ======================== RELATIONSHIPS ========================

  /** Cart this item belongs to */
  @ManyToOne(() => ORMCart, (cart) => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id' })
  cart: ORMCart;

  /** Product for this cart item */
  @ManyToOne(() => ORMProduct)
  @JoinColumn({ name: 'product_id' })
  product: ORMProduct;

  /** Product variant for this cart item */
  @ManyToOne(() => ORMProductVariant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'variant_id' })
  variant: ORMProductVariant;

  /** Shop that sells this product */
  @ManyToOne(() => ORMShop)
  @JoinColumn({ name: 'shop_id' })
  shop: ORMShop;
}

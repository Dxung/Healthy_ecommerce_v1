import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { ORMProduct } from './orm.product.entity';
import { ORMProductOptionValue } from './orm.product-option-value.entity';

/**
 * ORM Entity for product_options table.
 * Represents option types like "Size", "Color" for a product.
 */
@Entity('product_options', { schema: 'product_schema' })
@Index('idx_product_options_product_id', ['productId'])
@Unique('uq_product_option_name', ['productId', 'name'])
export class ORMProductOption {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'sort_order', type: 'integer', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  // ======================== RELATIONSHIPS ========================

  /** Product this option belongs to */
  @ManyToOne(() => ORMProduct, (product) => product.options, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: ORMProduct;

  /** Option values (e.g., "S", "M", "L" for Size) */
  @OneToMany(() => ORMProductOptionValue, (value) => value.option)
  values: ORMProductOptionValue[];
}

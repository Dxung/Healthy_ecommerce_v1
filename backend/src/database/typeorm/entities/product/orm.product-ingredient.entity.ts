import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { ORMProduct } from './orm.product.entity';

/**
 * ORM Entity for product_ingredients table.
 * Stores product ingredients with sort order.
 */
@Entity('product_ingredients', { schema: 'product_schema' })
@Index('idx_product_ingredients_product_id', ['productId'])
@Index('idx_product_ingredients_name', ['name'])
@Unique('uq_product_ingredient_name', ['productId', 'name'])
export class ORMProductIngredient {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'sort_order', type: 'integer', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  // ======================== RELATIONSHIPS ========================

  /** Product this ingredient belongs to */
  @ManyToOne(() => ORMProduct, (product) => product.ingredients, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: ORMProduct;
}

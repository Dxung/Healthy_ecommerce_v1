import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ORMProduct } from './orm.product.entity';

/**
 * ORM Entity for product_images table.
 * Stores product gallery images with sort order.
 */
@Entity('product_images', { schema: 'product_schema' })
@Index('idx_product_images_product_id', ['productId'])
export class ORMProductImage {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @Column({ name: 'image_url', type: 'varchar', length: 500 })
  imageUrl: string;

  @Column({ name: 'sort_order', type: 'integer', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  // ======================== RELATIONSHIPS ========================

  /** Product this image belongs to */
  @ManyToOne(() => ORMProduct, (product) => product.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: ORMProduct;
}

import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { ORMProduct } from './orm.product.entity';
import { ORMProductVariantOption } from './orm.product-variant-option.entity';
import { ORMUnit } from './orm.unit.entity';

/**
 * ORM Entity for product_variants table.
 * Represents purchasable SKUs with price and stock.
 */
@Entity('product_variants', { schema: 'product_schema' })
@Index('idx_product_variants_product_id', ['productId'])
@Index('idx_product_variants_sku', ['sku'])
@Index('idx_product_variants_selling_unit_id', ['sellingUnitId'])
@Index('idx_product_variants_expiry_date', ['expiryDate'])
export class ORMProductVariant {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @Column({ name: 'sku', type: 'varchar', length: 100, nullable: true })
  sku: string | null;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'price', type: 'decimal', precision: 15, scale: 2 })
  price: number;

  @Column({
    name: 'compare_at_price',
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
  })
  compareAtPrice: number | null;

  @Column({ name: 'stock_quantity', type: 'integer', default: 0 })
  stockQuantity: number;

  @Column({ name: 'image_url', type: 'varchar', length: 500, nullable: true })
  imageUrl: string | null;

  @Column({ name: 'selling_unit_id', type: 'uuid', nullable: true })
  sellingUnitId: string | null;

  @Column({
    name: 'unit_quantity',
    type: 'decimal',
    precision: 10,
    scale: 3,
    nullable: true,
  })
  unitQuantity: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'expiry_date', type: 'date', nullable: true })
  expiryDate: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  // ======================== RELATIONSHIPS ========================

  /** Product this variant belongs to */
  @ManyToOne(() => ORMProduct, (product) => product.variants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: ORMProduct;

  /** Selling unit (e.g., Box, Pack) */
  @ManyToOne(() => ORMUnit)
  @JoinColumn({ name: 'selling_unit_id' })
  sellingUnit: ORMUnit | null;

  /** Option values for this variant (e.g., Size=M, Color=Red) */
  @OneToMany(() => ORMProductVariantOption, (vo) => vo.variant)
  optionValues: ORMProductVariantOption[];
}

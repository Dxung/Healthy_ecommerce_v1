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
  Unique,
} from 'typeorm';
import { ORMShop } from '../shop';
import { ORMCategory } from './orm.category.entity';
import { ORMBrand } from './orm.brand.entity';
import { ORMProductImage } from './orm.product-image.entity';
import { ORMProductIngredient } from './orm.product-ingredient.entity';
import { ORMProductOption } from './orm.product-option.entity';
import { ORMProductVariant } from './orm.product-variant.entity';
import { ORMUnit } from './orm.unit.entity';
import { ProductStatus } from './enums/product-status.enum';

/**
 * ORM Entity for products table.
 * Main product entity with relationships to images, options, and variants.
 */
@Entity('products', { schema: 'product_schema' })
@Index('idx_products_shop_id', ['shopId'])
@Index('idx_products_category_id', ['categoryId'])
@Index('idx_products_brand_id', ['brandId'])
@Index('idx_products_status', ['status'])
@Index('idx_products_is_visible', ['isVisible'])
@Index('idx_products_serving_unit_id', ['servingUnitId'])
@Unique('uq_product_shop_slug', ['shopId', 'slug'])
export class ORMProduct {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'shop_id', type: 'uuid' })
  shopId: string;

  @Column({ name: 'category_id', type: 'uuid' })
  categoryId: string;

  @Column({ name: 'brand_id', type: 'uuid', nullable: true })
  brandId: string | null;

  @Column({ name: 'name', type: 'varchar', length: 500 })
  name: string;

  @Column({ name: 'slug', type: 'varchar', length: 500 })
  slug: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'thumbnail_url', type: 'varchar', length: 500 })
  thumbnailUrl: string;

  @Column({
    name: 'min_price',
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
  })
  minPrice: number;

  @Column({
    name: 'max_price',
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
  })
  maxPrice: number;

  @Column({ name: 'total_sold', type: 'integer', default: 0 })
  totalSold: number;

  @Column({
    name: 'average_rating',
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 0,
  })
  averageRating: number;

  @Column({ name: 'total_ratings', type: 'integer', default: 0 })
  totalRatings: number;

  @Column({ name: 'is_official_approved', type: 'boolean', default: false })
  isOfficialApproved: boolean;

  @Column({ name: 'is_visible', type: 'boolean', default: true })
  isVisible: boolean;

  @Column({
    name: 'serving_size',
    type: 'decimal',
    precision: 10,
    scale: 3,
    nullable: true,
  })
  servingSize: string | null;

  @Column({ name: 'serving_unit_id', type: 'uuid', nullable: true })
  servingUnitId: string | null;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ProductStatus,
    enumName: 'product_status_enum',
    default: ProductStatus.DRAFT,
  })
  status: ProductStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  // ======================== RELATIONSHIPS ========================

  /** Shop that owns this product */
  @ManyToOne(() => ORMShop, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shop_id' })
  shop: ORMShop;

  /** Product category */
  @ManyToOne(() => ORMCategory)
  @JoinColumn({ name: 'category_id' })
  category: ORMCategory;

  /** Product brand (optional) */
  @ManyToOne(() => ORMBrand)
  @JoinColumn({ name: 'brand_id' })
  brand: ORMBrand | null;

  /** Serving unit (e.g., g, ml for "per 100g") */
  @ManyToOne(() => ORMUnit)
  @JoinColumn({ name: 'serving_unit_id' })
  servingUnit: ORMUnit | null;

  /** Product images */
  @OneToMany(() => ORMProductImage, (image) => image.product)
  images: ORMProductImage[];

  /** Product options (e.g., Size, Color) */
  @OneToMany(() => ORMProductOption, (option) => option.product)
  options: ORMProductOption[];

  /** Product variants (SKUs with price/stock) */
  @OneToMany(() => ORMProductVariant, (variant) => variant.product)
  variants: ORMProductVariant[];

  /** Product ingredients */
  @OneToMany(() => ORMProductIngredient, (ingredient) => ingredient.product)
  ingredients: ORMProductIngredient[];
}

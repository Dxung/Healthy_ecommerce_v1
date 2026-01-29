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
import { ORMProductVariant } from './orm.product-variant.entity';
import { ORMProductOptionValue } from './orm.product-option-value.entity';

/**
 * ORM Entity for product_variant_options table.
 * Junction table linking variants to their option values.
 */
@Entity('product_variant_options', { schema: 'product_schema' })
@Index('idx_variant_options_variant_id', ['variantId'])
@Unique('uq_variant_option', ['variantId', 'optionValueId'])
export class ORMProductVariantOption {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'variant_id', type: 'uuid' })
  variantId: string;

  @Column({ name: 'option_value_id', type: 'uuid' })
  optionValueId: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  // ======================== RELATIONSHIPS ========================

  /** Variant this belongs to */
  @ManyToOne(() => ORMProductVariant, (variant) => variant.optionValues, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'variant_id' })
  variant: ORMProductVariant;

  /** Option value */
  @ManyToOne(() => ORMProductOptionValue, (value) => value.variantOptions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'option_value_id' })
  optionValue: ORMProductOptionValue;
}

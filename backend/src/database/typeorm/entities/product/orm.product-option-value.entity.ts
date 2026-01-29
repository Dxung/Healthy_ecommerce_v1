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
import { ORMProductOption } from './orm.product-option.entity';
import { ORMProductVariantOption } from './orm.product-variant-option.entity';

/**
 * ORM Entity for product_option_values table.
 * Represents specific values for an option (e.g., "S", "M", "L" for Size).
 */
@Entity('product_option_values', { schema: 'product_schema' })
@Index('idx_product_option_values_option_id', ['optionId'])
@Unique('uq_option_value', ['optionId', 'value'])
export class ORMProductOptionValue {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'option_id', type: 'uuid' })
  optionId: string;

  @Column({ name: 'value', type: 'varchar', length: 100 })
  value: string;

  @Column({ name: 'sort_order', type: 'integer', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  // ======================== RELATIONSHIPS ========================

  /** Option this value belongs to */
  @ManyToOne(() => ORMProductOption, (option) => option.values, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'option_id' })
  option: ORMProductOption;

  /** Variant options linking to this value */
  @OneToMany(() => ORMProductVariantOption, (vo) => vo.optionValue)
  variantOptions: ORMProductVariantOption[];
}

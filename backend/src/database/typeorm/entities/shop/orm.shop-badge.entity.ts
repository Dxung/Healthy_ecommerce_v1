import {
  Entity,
  PrimaryColumn,
  Column,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { ShopBadgeCode } from './enums/shop-badge-code.enum';
import { ORMBadgeRequirement } from './orm.badge-requirement.entity';

/**
 * ORM Entity for shop_badges table.
 * Represents badge configuration (what badges exist, their benefits).
 * Badges are hardcoded - admin can only toggle is_active, not add/delete.
 */
@Entity('shop_badges', { schema: 'shop_schema' })
export class ORMShopBadge {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({
    name: 'code',
    type: 'enum',
    enum: ShopBadgeCode,
    enumName: 'badge_code_enum',
    unique: true,
  })
  code: ShopBadgeCode;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string | null;

  @Column({
    name: 'platform_fee_discount_percent',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  platformFeeDiscountPercent: number | null;

  @Column({
    name: 'search_boost_multiplier',
    type: 'decimal',
    precision: 3,
    scale: 2,
    nullable: true,
  })
  searchBoostMultiplier: number | null;

  @Column({ name: 'max_product_slots', type: 'integer' })
  maxProductSlots: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  // ======================== RELATIONSHIPS ========================

  /** Requirements for this badge */
  @OneToMany(() => ORMBadgeRequirement, (req) => req.badge)
  requirements: ORMBadgeRequirement[];
}

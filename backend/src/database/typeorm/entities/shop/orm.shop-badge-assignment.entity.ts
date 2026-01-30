import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  UpdateDateColumn,
} from 'typeorm';
import { ORMShop } from './orm.shop.entity';
import { ORMBrand } from '../product/orm.brand.entity';
import { ShopBadgeCode } from './enums/shop-badge-code.enum';
import { ShopBadgeStatus } from './enums/shop-badge-status.enum';

/**
 * ORM Entity for shop_badge_assignments table.
 * Tracks badge assignments (preferred/approved/official) for shops.
 *
 * Unique constraints:
 * - PREFERRED/APPROVED: one per shop (shopId + badgeCode)
 * - OFFICIAL: one per shop per brand (shopId + badgeCode + brandId)
 */
@Entity('shop_badge_assignments', { schema: 'shop_schema' })
@Index('idx_shop_badge_assignments_shop_id', ['shopId'])
@Index('idx_shop_badge_assignments_status', ['status'])
@Index('idx_shop_badge_assignments_brand_id', ['brandId'])
export class ORMShopBadgeAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'shop_id', type: 'uuid' })
  shopId: string;

  @Column({
    name: 'badge_code',
    type: 'enum',
    enum: ShopBadgeCode,
    enumName: 'badge_code_enum',
  })
  badgeCode: ShopBadgeCode;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ShopBadgeStatus,
    enumName: 'badge_status_enum',
    default: ShopBadgeStatus.ACTIVE,
  })
  status: ShopBadgeStatus;

  @Column({
    name: 'granted_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  grantedAt: Date;

  @Column({ name: 'disabled_at', type: 'timestamp', nullable: true })
  disabledAt: Date | null;

  @Column({ name: 'disabled_reason', type: 'text', nullable: true })
  disabledReason: string | null;

  /** Expiration date for badge (for APPROVED/OFFICIAL badges) */
  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt: Date | null;

  /** Brand ID for OFFICIAL badges (null for PREFERRED/APPROVED) */
  @Column({ name: 'brand_id', type: 'uuid', nullable: true })
  brandId: string | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  // ======================== RELATIONSHIPS ========================

  /** Shop this badge belongs to */
  @ManyToOne(() => ORMShop, (shop) => shop.badgeAssignments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'shop_id' })
  shop: ORMShop;

  /** Brand for OFFICIAL badges */
  @ManyToOne(() => ORMBrand, { nullable: true })
  @JoinColumn({ name: 'brand_id' })
  brand: ORMBrand | null;
}

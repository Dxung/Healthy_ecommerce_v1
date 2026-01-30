import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { ORMShop } from './orm.shop.entity';
import { ORMBrand } from '../product/orm.brand.entity';
import { ORMBadgeApplication } from './orm.badge-application.entity';

/**
 * ORM Entity for shop_official_brands table.
 * Tracks which brands a shop is officially authorized to represent.
 */
@Entity('shop_official_brands', { schema: 'shop_schema' })
@Index('idx_shop_official_brands_shop_id', ['shopId'])
@Index('idx_shop_official_brands_brand_id', ['brandId'])
@Unique('uq_shop_official_brand', ['shopId', 'brandId'])
export class ORMShopOfficialBrand {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'shop_id', type: 'uuid' })
  shopId: string;

  @Column({ name: 'brand_id', type: 'uuid' })
  brandId: string;

  /** Application that granted this official status */
  @Column({ name: 'application_id', type: 'uuid', nullable: true })
  applicationId: string | null;

  @Column({
    name: 'granted_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  grantedAt: Date;

  /** Expiration date (earliest expiry from documents) */
  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @Column({ name: 'revoked_at', type: 'timestamp', nullable: true })
  revokedAt: Date | null;

  @Column({ name: 'revoked_reason', type: 'varchar', length: 500, nullable: true })
  revokedReason: string | null;

  // ======================== RELATIONSHIPS ========================

  /** Shop that has this official brand status */
  @ManyToOne(() => ORMShop, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shop_id' })
  shop: ORMShop;

  /** Brand that shop is official for */
  @ManyToOne(() => ORMBrand)
  @JoinColumn({ name: 'brand_id' })
  brand: ORMBrand;

  /** Application that granted this status */
  @ManyToOne(() => ORMBadgeApplication, { nullable: true })
  @JoinColumn({ name: 'application_id' })
  application: ORMBadgeApplication | null;
}

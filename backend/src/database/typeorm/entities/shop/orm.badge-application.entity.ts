import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ORMShop } from './orm.shop.entity';
import { ORMBrand } from '../product/orm.brand.entity';
import { ORMUserCore } from '../user/orm.user-core.entity';
import { ORMBadgeApplicationDocument } from './orm.badge-application-document.entity';
import { BadgeApplicationType } from './enums/badge-application-type.enum';
import { BadgeApplicationStatus } from './enums/badge-application-status.enum';

/**
 * ORM Entity for badge_applications table.
 * Tracks badge applications submitted by shops for Verified or Official badges.
 */
@Entity('badge_applications', { schema: 'shop_schema' })
@Index('idx_badge_applications_shop_id', ['shopId'])
@Index('idx_badge_applications_status', ['status'])
@Index('idx_badge_applications_type', ['applicationType'])
@Index('idx_badge_applications_brand_id', ['brandId'])
export class ORMBadgeApplication {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'shop_id', type: 'uuid' })
  shopId: string;

  @Column({
    name: 'application_type',
    type: 'enum',
    enum: BadgeApplicationType,
    enumName: 'badge_application_type_enum',
  })
  applicationType: BadgeApplicationType;

  /** Brand ID for OFFICIAL applications (null for VERIFIED) */
  @Column({ name: 'brand_id', type: 'uuid', nullable: true })
  brandId: string | null;

  @Column({
    name: 'status',
    type: 'enum',
    enum: BadgeApplicationStatus,
    enumName: 'badge_application_status_enum',
    default: BadgeApplicationStatus.PENDING,
  })
  status: BadgeApplicationStatus;

  @Column({ name: 'rejection_reason', type: 'varchar', length: 500, nullable: true })
  rejectionReason: string | null;

  @Column({ name: 'reviewed_by', type: 'uuid', nullable: true })
  reviewedBy: string | null;

  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  // ======================== RELATIONSHIPS ========================

  /** Shop that submitted this application */
  @ManyToOne(() => ORMShop, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shop_id' })
  shop: ORMShop;

  /** Brand for OFFICIAL applications */
  @ManyToOne(() => ORMBrand, { nullable: true })
  @JoinColumn({ name: 'brand_id' })
  brand: ORMBrand | null;

  /** Admin who reviewed this application */
  @ManyToOne(() => ORMUserCore, { nullable: true })
  @JoinColumn({ name: 'reviewed_by' })
  reviewer: ORMUserCore | null;

  /** Documents submitted with this application */
  @OneToMany(() => ORMBadgeApplicationDocument, (doc) => doc.application, {
    cascade: true,
  })
  documents: ORMBadgeApplicationDocument[];
}

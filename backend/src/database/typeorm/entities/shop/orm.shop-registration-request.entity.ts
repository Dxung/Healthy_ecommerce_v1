import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { ORMUserCore } from '../user';
import { ORMShopRegistrationDocument } from './orm.shop-registration-document.entity';
import { ORMShopRegistrationBrandDocument } from './orm.shop-registration-brand-document.entity';
import { ShopRegistrationStatus } from './enums/shop-registration-status.enum';

/**
 * Entity representing a shop registration request.
 * Users submit registration requests which admin can approve or reject.
 */
@Entity('shop_registration_requests', { schema: 'shop_schema' })
@Index('idx_shop_reg_user_pending', ['userId'], {
  where: `"status" = 'pending'`,
  unique: true,
})
export class ORMShopRegistrationRequest {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'slug', type: 'varchar', length: 255 })
  slug: string;

  @Column({ name: 'logo_url', type: 'varchar', length: 500, nullable: true })
  logoUrl: string | null;

  @Column({ name: 'cover_url', type: 'varchar', length: 500, nullable: true })
  coverUrl: string | null;

  @Column({ name: 'phone', type: 'varchar', length: 20 })
  phone: string;

  @Column({ name: 'email', type: 'varchar', length: 255 })
  email: string;

  @Column({ name: 'address_line', type: 'varchar', length: 255 })
  addressLine: string;

  @Column({ name: 'ward_id', type: 'varchar', length: 50 })
  wardId: string;

  @Column({ name: 'district_id', type: 'varchar', length: 50 })
  districtId: string;

  @Column({ name: 'province_id', type: 'varchar', length: 50 })
  provinceId: string;

  @Column({ name: 'requested_brand_id', type: 'uuid', nullable: true })
  requestedBrandId: string | null;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ShopRegistrationStatus,
    default: ShopRegistrationStatus.PENDING,
  })
  status: ShopRegistrationStatus;

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

  // Relationships
  @ManyToOne(() => ORMUserCore, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: ORMUserCore;

  @ManyToOne(() => ORMUserCore)
  @JoinColumn({ name: 'reviewed_by' })
  reviewer: ORMUserCore;

  @OneToMany(() => ORMShopRegistrationDocument, (doc) => doc.registration)
  documents: ORMShopRegistrationDocument[];

  @OneToMany(() => ORMShopRegistrationBrandDocument, (doc) => doc.registration)
  brandDocuments: ORMShopRegistrationBrandDocument[];
}

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
import { ORMUserCore } from '../user';
import { ShopStatus } from './enums/shop-status.enum';
import { ORMShopBadgeAssignment } from './orm.shop-badge-assignment.entity';

/**
 * ORM Entity for shops table.
 * Represents an approved shop that can sell products.
 */
@Entity('shops', { schema: 'shop_schema' })
@Index('idx_shops_status', ['status'])
export class ORMShop {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'registration_id', type: 'uuid' })
  registrationId: string;

  @Column({ name: 'owner_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'slug', type: 'varchar', length: 255, unique: true })
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

  @Column({ name: 'total_products', type: 'integer', default: 0 })
  totalProducts: number;

  @Column({ name: 'total_orders', type: 'integer', default: 0 })
  totalOrders: number;

  @Column({
    name: 'order_success_rate',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
  })
  orderSuccessRate: number;

  @Column({
    name: 'response_time_hours',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
  })
  responseTimeHours: number;

  @Column({
    name: 'return_rate',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
  })
  returnRate: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ShopStatus,
    enumName: 'shop_status_enum',
    default: ShopStatus.ACTIVE,
  })
  status: ShopStatus;

  @Column({ name: 'is_refund_debt', type: 'boolean', default: false })
  isRefundDebt: boolean;

  @Column({ name: 'is_admin_suspended', type: 'boolean', default: false })
  isAdminSuspended: boolean;

  @Column({ name: 'status_reason', type: 'text', nullable: true })
  statusReason: string | null;

  @Column({ name: 'status_changed_at', type: 'timestamp', nullable: true })
  statusChangedAt: Date | null;

  @Column({ name: 'status_changed_by', type: 'uuid', nullable: true })
  statusChangedBy: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  // ======================== RELATIONSHIPS ========================

  /** Shop owner (user) */
  @ManyToOne(() => ORMUserCore, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  user: ORMUserCore;

  /** User who changed shop status */
  @ManyToOne(() => ORMUserCore)
  @JoinColumn({ name: 'status_changed_by' })
  statusChangedByUser: ORMUserCore;

  /** Badge assignments for this shop */
  @OneToMany(() => ORMShopBadgeAssignment, (badge) => badge.shop)
  badgeAssignments: ORMShopBadgeAssignment[];
}

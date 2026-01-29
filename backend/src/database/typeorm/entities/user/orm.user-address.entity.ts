import {
  Entity,
  PrimaryColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ORMUserCore } from './orm.user-core.entity';

/**
 * Entity representing a user's address.
 * Used specifically for typeORM database
 */
@Entity('user_addresses', { schema: 'users_schema' })
@Index('idx_only_one_default', ['userId'], {
  where: '"is_default" = TRUE',
  unique: true,
})
export class ORMUserAddress {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'label', type: 'varchar', length: 50, default: 'HOME' })
  label: string;

  @Column({ name: 'recipient_name', type: 'varchar', length: 255 })
  recipientName: string;

  @Column({ name: 'recipient_phone', type: 'varchar', length: 20 })
  recipientPhone: string;

  @Column({ name: 'address_line', type: 'varchar', length: 255 })
  addressLine: string;

  @Column({ name: 'ward_id', type: 'varchar', length: 50 })
  wardId: string;

  @Column({ name: 'district_id', type: 'varchar', length: 50 })
  districtId: string;

  @Column({ name: 'province_id', type: 'varchar', length: 50 })
  provinceId: string;

  @Column({
    name: 'latitude',
    type: 'decimal',
    precision: 10,
    scale: 8,
    nullable: true,
  })
  latitude: number | null;

  @Column({
    name: 'longitude',
    type: 'decimal',
    precision: 11,
    scale: 8,
    nullable: true,
  })
  longitude: number | null;

  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  // user_address -> user_core
  @ManyToOne(() => ORMUserCore, (user) => user.addresses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: ORMUserCore;
}

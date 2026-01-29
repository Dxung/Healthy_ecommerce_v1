import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ORMProvince } from './orm.province.entity';
import { ORMWard } from './orm.ward.entity';

/**
 * Entity representing a district in Vietnam.
 * Used specifically for TypeORM database
 */
@Entity('districts', { schema: 'location_schema' })
export class ORMDistrict {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  id: string;

  @Column({ name: 'province_id', type: 'varchar', length: 50 })
  provinceId: string;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'name_en', type: 'varchar', length: 100, nullable: true })
  nameEn: string | null;

  @Column({ name: 'type', type: 'varchar', length: 20, nullable: true })
  type: string | null;

  @Column({ name: 'name_with_type', type: 'varchar', length: 150, nullable: true })
  nameWithType: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => ORMProvince, (province) => province.districts)
  @JoinColumn({ name: 'province_id' })
  province: ORMProvince;

  @OneToMany(() => ORMWard, (ward) => ward.district)
  wards: ORMWard[];
}

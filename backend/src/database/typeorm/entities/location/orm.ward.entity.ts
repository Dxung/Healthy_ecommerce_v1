import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ORMDistrict } from './orm.district.entity';

/**
 * Entity representing a ward/commune in Vietnam.
 * Used specifically for TypeORM database
 */
@Entity('wards', { schema: 'location_schema' })
export class ORMWard {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  id: string;

  @Column({ name: 'district_id', type: 'varchar', length: 50 })
  districtId: string;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'name_en', type: 'varchar', length: 100, nullable: true })
  nameEn: string | null;

  @Column({ name: 'type', type: 'varchar', length: 20, nullable: true })
  type: string | null;

  @Column({
    name: 'name_with_type',
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  nameWithType: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => ORMDistrict, (district) => district.wards)
  @JoinColumn({ name: 'district_id' })
  district: ORMDistrict;
}

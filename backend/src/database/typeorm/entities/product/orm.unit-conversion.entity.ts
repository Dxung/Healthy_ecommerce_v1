import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { ORMUnit } from './orm.unit.entity';

/**
 * ORM Entity for unit_conversions table.
 * Stores conversion factors between units.
 * Always stores conversions TO the base unit (kg → g, L → ml).
 */
@Entity('unit_conversions', { schema: 'product_schema' })
@Unique('uq_unit_conversion_pair', ['fromUnitId', 'toUnitId'])
@Index('idx_unit_conversions_from_unit', ['fromUnitId'])
@Index('idx_unit_conversions_to_unit', ['toUnitId'])
export class ORMUnitConversion {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'from_unit_id', type: 'uuid' })
  fromUnitId: string;

  @Column({ name: 'to_unit_id', type: 'uuid' })
  toUnitId: string;

  @Column({
    name: 'conversion_factor',
    type: 'decimal',
    precision: 20,
    scale: 10,
  })
  conversionFactor: string; // Stored as string for precision

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  // ======================== RELATIONSHIPS ========================

  /** Source unit */
  @ManyToOne(() => ORMUnit, (unit) => unit.conversionsFrom, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'from_unit_id' })
  fromUnit: ORMUnit;

  /** Target unit */
  @ManyToOne(() => ORMUnit, (unit) => unit.conversionsTo, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'to_unit_id' })
  toUnit: ORMUnit;
}

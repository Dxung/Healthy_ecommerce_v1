import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { UnitCategory } from './enums/unit-category.enum';
import { UnitType } from './enums/unit-type.enum';
import { ORMUnitConversion } from './orm.unit-conversion.entity';

/**
 * ORM Entity for units table.
 * Stores measurement units (g, kg, ml, L) and selling units (Box, Pack).
 */
@Entity('units', { schema: 'product_schema' })
@Index('idx_units_symbol', ['symbol'], { unique: true })
@Index('idx_units_category', ['category'])
@Index('idx_units_is_active', ['isActive'])
export class ORMUnit {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'symbol', type: 'varchar', length: 20, unique: true })
  symbol: string;

  @Column({
    name: 'category',
    type: 'enum',
    enum: UnitCategory,
  })
  category: UnitCategory;

  @Column({
    name: 'type',
    type: 'enum',
    enum: UnitType,
    nullable: true,
  })
  type: UnitType | null;

  @Column({ name: 'is_base', type: 'boolean', default: false })
  isBase: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  // ======================== RELATIONSHIPS ========================

  /** Conversions where this unit is the source */
  @OneToMany(() => ORMUnitConversion, (conversion) => conversion.fromUnit)
  conversionsFrom: ORMUnitConversion[];

  /** Conversions where this unit is the target */
  @OneToMany(() => ORMUnitConversion, (conversion) => conversion.toUnit)
  conversionsTo: ORMUnitConversion[];
}

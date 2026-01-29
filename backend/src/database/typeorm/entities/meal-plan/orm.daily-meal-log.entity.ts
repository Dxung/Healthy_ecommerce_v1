import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ORMUserCore } from '../user';
import { ORMProduct } from '../product';
import { ORMFoodPreset } from './orm.food-preset.entity';
import { MealType } from './enums/meal-type.enum';
import { MealSourceType } from './enums/meal-source-type.enum';

@Entity('daily_meal_logs', { schema: 'meal_plan_schema' })
@Index('idx_daily_meal_logs_user_id', ['userId'])
@Index('idx_daily_meal_logs_log_date', ['logDate'])
@Index('idx_daily_meal_logs_user_date', ['userId', 'logDate'])
@Index('idx_daily_meal_logs_meal_type', ['mealType'])
@Index('idx_daily_meal_logs_product_id', ['productId'])
@Index('idx_daily_meal_logs_preset_id', ['presetId'])
export class ORMDailyMealLog {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'log_date', type: 'date' })
  logDate: Date;

  @Column({
    name: 'meal_type',
    type: 'enum',
    enum: MealType,
    enumName: 'meal_plan_schema.meal_type_enum',
  })
  mealType: MealType;

  @Column({
    name: 'source_type',
    type: 'enum',
    enum: MealSourceType,
    enumName: 'meal_plan_schema.meal_source_type_enum',
  })
  sourceType: MealSourceType;

  @Column({ name: 'product_id', type: 'uuid', nullable: true })
  productId: string | null;

  @Column({ name: 'preset_id', type: 'uuid', nullable: true })
  presetId: string | null;

  @Column({ name: 'food_name', type: 'varchar', length: 200 })
  foodName: string;

  @Column({
    name: 'quantity',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  quantity: string;

  @Column({
    name: 'serving_size_snapshot',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  servingSizeSnapshot: string | null;

  @Column({
    name: 'serving_unit_snapshot',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  servingUnitSnapshot: string | null;

  @Column({
    name: 'calories_logged',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  caloriesLogged: string;

  @Column({
    name: 'protein_logged',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  proteinLogged: string | null;

  @Column({
    name: 'carbs_logged',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  carbsLogged: string | null;

  @Column({
    name: 'fat_logged',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  fatLogged: string | null;

  @Column({
    name: 'fiber_logged',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  fiberLogged: string | null;

  @Column({
    name: 'sugar_logged',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  sugarLogged: string | null;

  @Column({
    name: 'sodium_logged',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  sodiumLogged: string | null;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  // ======================== RELATIONSHIPS ========================

  @ManyToOne(() => ORMUserCore, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: ORMUserCore;

  @ManyToOne(() => ORMProduct, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'product_id' })
  product: ORMProduct | null;

  @ManyToOne(() => ORMFoodPreset, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'preset_id' })
  preset: ORMFoodPreset | null;
}

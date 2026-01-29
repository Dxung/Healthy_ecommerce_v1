import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ORMProduct } from './orm.product.entity';

/**
 * ORM Entity for product_nutrition table.
 * Stores nutritional information for products.
 */
@Entity('product_nutrition', { schema: 'product_schema' })
@Index('idx_product_nutrition_product_id', ['productId'])
export class ORMProductNutrition {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'product_id', type: 'uuid', unique: true })
  productId: string;

  @Column({
    name: 'serving_size',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  servingSize: string;

  @Column({ name: 'serving_unit', type: 'varchar', length: 20 })
  servingUnit: string;

  @Column({
    name: 'servings_per_container',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  servingsPerContainer: string | null;

  @Column({
    name: 'calories',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  calories: string | null;

  @Column({
    name: 'protein',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  protein: string | null;

  @Column({
    name: 'carbohydrates',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  carbohydrates: string | null;

  @Column({
    name: 'fat',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  fat: string | null;

  @Column({
    name: 'saturated_fat',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  saturatedFat: string | null;

  @Column({
    name: 'trans_fat',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  transFat: string | null;

  @Column({
    name: 'cholesterol',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  cholesterol: string | null;

  @Column({
    name: 'sodium',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  sodium: string | null;

  @Column({
    name: 'fiber',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  fiber: string | null;

  @Column({
    name: 'sugar',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  sugar: string | null;

  @Column({
    name: 'added_sugar',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  addedSugar: string | null;

  @Column({
    name: 'vitamin_a',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  vitaminA: string | null;

  @Column({
    name: 'vitamin_c',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  vitaminC: string | null;

  @Column({
    name: 'vitamin_d',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  vitaminD: string | null;

  @Column({
    name: 'vitamin_e',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  vitaminE: string | null;

  @Column({
    name: 'vitamin_k',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  vitaminK: string | null;

  @Column({
    name: 'vitamin_b1',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  vitaminB1: string | null;

  @Column({
    name: 'vitamin_b2',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  vitaminB2: string | null;

  @Column({
    name: 'vitamin_b3',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  vitaminB3: string | null;

  @Column({
    name: 'vitamin_b6',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  vitaminB6: string | null;

  @Column({
    name: 'vitamin_b12',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  vitaminB12: string | null;

  @Column({
    name: 'calcium',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  calcium: string | null;

  @Column({
    name: 'iron',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  iron: string | null;

  @Column({
    name: 'potassium',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  potassium: string | null;

  @Column({
    name: 'magnesium',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  magnesium: string | null;

  @Column({
    name: 'zinc',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  zinc: string | null;

  @Column({ name: 'other_nutrients', type: 'jsonb', nullable: true })
  otherNutrients: Record<string, number> | null;

  @Column({ name: 'allergens', type: 'text', array: true, nullable: true })
  allergens: string[] | null;

  @Column({ name: 'dietary_info', type: 'text', array: true, nullable: true })
  dietaryInfo: string[] | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  // ======================== RELATIONSHIPS ========================

  @OneToOne(() => ORMProduct, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: ORMProduct;
}

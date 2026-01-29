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
import { PresetSource } from './enums/preset-source.enum';

@Entity('food_presets', { schema: 'meal_plan_schema' })
@Index('idx_food_presets_creator_id', ['creatorId'])
@Index('idx_food_presets_is_public', ['isPublic'])
@Index('idx_food_presets_source', ['source'])
export class ORMFoodPreset {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'creator_id', type: 'uuid' })
  creatorId: string;

  @Column({ name: 'name', type: 'varchar', length: 200 })
  name: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'image_url', type: 'varchar', length: 500, nullable: true })
  imageUrl: string | null;

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
    name: 'calories',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  calories: string;

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
    name: 'sodium',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  sodium: string | null;

  @Column({
    name: 'source',
    type: 'enum',
    enum: PresetSource,
    enumName: 'meal_plan_schema.preset_source_enum',
    default: PresetSource.USER,
  })
  source: PresetSource;

  @Column({ name: 'is_public', type: 'boolean', default: false })
  isPublic: boolean;

  @Column({ name: 'upvote_count', type: 'integer', default: 0 })
  upvoteCount: number;

  @Column({ name: 'downvote_count', type: 'integer', default: 0 })
  downvoteCount: number;

  @Column({ name: 'use_count', type: 'integer', default: 0 })
  useCount: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  // ======================== RELATIONSHIPS ========================

  @ManyToOne(() => ORMUserCore, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'creator_id' })
  creator: ORMUserCore;
}

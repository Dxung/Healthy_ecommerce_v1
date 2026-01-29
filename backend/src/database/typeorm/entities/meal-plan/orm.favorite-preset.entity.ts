import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { ORMUserCore } from '../user';
import { ORMFoodPreset } from './orm.food-preset.entity';

@Entity('favorite_presets', { schema: 'meal_plan_schema' })
@Index('idx_favorite_presets_user_id', ['userId'])
@Index('idx_favorite_presets_preset_id', ['presetId'])
@Unique(['userId', 'presetId'])
export class ORMFavoritePreset {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'preset_id', type: 'uuid' })
  presetId: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  // ======================== RELATIONSHIPS ========================

  @ManyToOne(() => ORMUserCore, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: ORMUserCore;

  @ManyToOne(() => ORMFoodPreset, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'preset_id' })
  preset: ORMFoodPreset;
}

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
import { ORMUserCore } from '../user';
import { ORMFoodPreset } from './orm.food-preset.entity';
import { VoteType } from './enums/vote-type.enum';

@Entity('preset_reactions', { schema: 'meal_plan_schema' })
@Index('idx_preset_reactions_preset_id', ['presetId'])
@Index('idx_preset_reactions_user_id', ['userId'])
@Unique(['presetId', 'userId'])
export class ORMPresetReaction {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'preset_id', type: 'uuid' })
  presetId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({
    name: 'vote_type',
    type: 'enum',
    enum: VoteType,
    enumName: 'meal_plan_schema.vote_type_enum',
  })
  voteType: VoteType;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  // ======================== RELATIONSHIPS ========================

  @ManyToOne(() => ORMFoodPreset, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'preset_id' })
  preset: ORMFoodPreset;

  @ManyToOne(() => ORMUserCore, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: ORMUserCore;
}

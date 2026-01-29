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
import { ORMDietTag } from '../product';

@Entity('user_diet_preferences', { schema: 'meal_plan_schema' })
@Index('idx_user_diet_preferences_user_id', ['userId'])
@Index('idx_user_diet_preferences_diet_tag_id', ['dietTagId'])
@Unique(['userId', 'dietTagId'])
export class ORMUserDietPreference {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'diet_tag_id', type: 'uuid' })
  dietTagId: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  // ======================== RELATIONSHIPS ========================

  @ManyToOne(() => ORMUserCore, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: ORMUserCore;

  @ManyToOne(() => ORMDietTag, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'diet_tag_id' })
  dietTag: ORMDietTag;
}

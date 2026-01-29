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
import { ORMAllergenTag } from '../product';

@Entity('user_allergen_exclusions', { schema: 'meal_plan_schema' })
@Index('idx_user_allergen_exclusions_user_id', ['userId'])
@Index('idx_user_allergen_exclusions_allergen_tag_id', ['allergenTagId'])
@Unique(['userId', 'allergenTagId'])
export class ORMUserAllergenExclusion {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'allergen_tag_id', type: 'uuid' })
  allergenTagId: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  // ======================== RELATIONSHIPS ========================

  @ManyToOne(() => ORMUserCore, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: ORMUserCore;

  @ManyToOne(() => ORMAllergenTag, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'allergen_tag_id' })
  allergenTag: ORMAllergenTag;
}

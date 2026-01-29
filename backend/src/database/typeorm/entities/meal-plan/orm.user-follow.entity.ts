import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
  Check,
} from 'typeorm';
import { ORMUserCore } from '../user';

@Entity('user_follows', { schema: 'meal_plan_schema' })
@Index('idx_user_follows_follower_id', ['followerId'])
@Index('idx_user_follows_following_id', ['followingId'])
@Unique(['followerId', 'followingId'])
@Check('follower_id != following_id')
export class ORMUserFollow {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'follower_id', type: 'uuid' })
  followerId: string;

  @Column({ name: 'following_id', type: 'uuid' })
  followingId: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  // ======================== RELATIONSHIPS ========================

  @ManyToOne(() => ORMUserCore, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'follower_id' })
  follower: ORMUserCore;

  @ManyToOne(() => ORMUserCore, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'following_id' })
  following: ORMUserCore;
}

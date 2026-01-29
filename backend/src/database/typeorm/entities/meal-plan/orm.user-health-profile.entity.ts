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
import { ORMUserCore } from '../user';
import { GoalType } from './enums/goal-type.enum';
import { ActivityLevel } from './enums/activity-level.enum';
import { Gender } from './enums/gender.enum';

@Entity('user_health_profiles', { schema: 'meal_plan_schema' })
@Index('idx_user_health_profiles_user_id', ['userId'])
@Index('idx_user_health_profiles_last_log_date', ['lastLogDate'])
export class ORMUserHealthProfile {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  @Column({
    name: 'weight_kg',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  weightKg: string | null;

  @Column({
    name: 'height_cm',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  heightCm: string | null;

  @Column({ name: 'birth_date', type: 'date', nullable: true })
  birthDate: Date | null;

  @Column({
    name: 'gender',
    type: 'enum',
    enum: Gender,
    enumName: 'meal_plan_schema.gender_enum',
    nullable: true,
  })
  gender: Gender | null;

  @Column({
    name: 'activity_level',
    type: 'enum',
    enum: ActivityLevel,
    enumName: 'meal_plan_schema.activity_level_enum',
    default: ActivityLevel.SEDENTARY,
  })
  activityLevel: ActivityLevel;

  @Column({
    name: 'goal_type',
    type: 'enum',
    enum: GoalType,
    enumName: 'meal_plan_schema.goal_type_enum',
    default: GoalType.MAINTAIN,
  })
  goalType: GoalType;

  @Column({ name: 'calorie_target', type: 'integer', nullable: true })
  calorieTarget: number | null;

  @Column({
    name: 'is_calorie_target_manual',
    type: 'boolean',
    default: false,
  })
  isCalorieTargetManual: boolean;

  @Column({ name: 'current_streak', type: 'integer', default: 0 })
  currentStreak: number;

  @Column({ name: 'longest_streak', type: 'integer', default: 0 })
  longestStreak: number;

  @Column({ name: 'last_log_date', type: 'date', nullable: true })
  lastLogDate: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  // ======================== RELATIONSHIPS ========================

  @OneToOne(() => ORMUserCore, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: ORMUserCore;
}

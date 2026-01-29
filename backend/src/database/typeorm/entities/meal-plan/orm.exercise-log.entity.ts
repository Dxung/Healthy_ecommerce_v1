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

@Entity('exercise_logs', { schema: 'meal_plan_schema' })
@Index('idx_exercise_logs_user_id', ['userId'])
@Index('idx_exercise_logs_log_date', ['logDate'])
@Index('idx_exercise_logs_user_date', ['userId', 'logDate'])
export class ORMExerciseLog {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'log_date', type: 'date' })
  logDate: Date;

  @Column({ name: 'exercise_name', type: 'varchar', length: 200 })
  exerciseName: string;

  @Column({ name: 'duration_minutes', type: 'integer' })
  durationMinutes: number;

  @Column({
    name: 'calories_burned',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  caloriesBurned: string;

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
}

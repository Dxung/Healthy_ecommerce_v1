import type { ResultAsync } from 'neverthrow';
import type { ExerciseLog } from '../models/exercise-log.model';
import type { DomainError } from 'src/shared/types/domain-error.type';

export interface IExerciseLogRepository {
  /**
   * Finds exercise log by its ID.
   */
  findById(id: string): ResultAsync<ExerciseLog | null, DomainError>;

  /**
   * Finds all exercise logs for a user on a specific date.
   */
  findByUserAndDate(
    userId: string,
    date: Date,
  ): ResultAsync<ExerciseLog[], DomainError>;

  /**
   * Finds all exercise logs for a user within a date range.
   */
  findByUserAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): ResultAsync<ExerciseLog[], DomainError>;

  /**
   * Creates an exercise log.
   */
  create(log: ExerciseLog): ResultAsync<ExerciseLog, DomainError>;

  /**
   * Updates an exercise log.
   */
  update(log: ExerciseLog): ResultAsync<ExerciseLog, DomainError>;

  /**
   * Deletes an exercise log.
   */
  delete(id: string): ResultAsync<void, DomainError>;

  /**
   * Get total calories burned for a user on a specific date.
   */
  getTotalCaloriesBurnedForDate(
    userId: string,
    date: Date,
  ): ResultAsync<number, DomainError>;
}

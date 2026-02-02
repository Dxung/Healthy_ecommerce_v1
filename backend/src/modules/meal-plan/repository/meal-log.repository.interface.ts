import type { ResultAsync } from 'neverthrow';
import type { DailyMealLog } from '../models/daily-meal-log.model';
import type { DomainError } from 'src/shared/types/domain-error.type';
import type { MealType } from 'src/database/typeorm/entities/meal-plan/enums/meal-type.enum';

export interface IMealLogRepository {
  /**
   * Finds meal log by its ID.
   */
  findById(id: string): ResultAsync<DailyMealLog | null, DomainError>;

  /**
   * Finds all meal logs for a user on a specific date.
   */
  findByUserAndDate(
    userId: string,
    date: Date,
  ): ResultAsync<DailyMealLog[], DomainError>;

  /**
   * Finds all meal logs for a user within a date range.
   */
  findByUserAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): ResultAsync<DailyMealLog[], DomainError>;

  /**
   * Finds meal logs for a specific meal type on a date.
   */
  findByUserDateAndMealType(
    userId: string,
    date: Date,
    mealType: MealType,
  ): ResultAsync<DailyMealLog[], DomainError>;

  /**
   * Creates a meal log.
   */
  create(log: DailyMealLog): ResultAsync<DailyMealLog, DomainError>;

  /**
   * Updates a meal log.
   */
  update(log: DailyMealLog): ResultAsync<DailyMealLog, DomainError>;

  /**
   * Deletes a meal log.
   */
  delete(id: string): ResultAsync<void, DomainError>;

  /**
   * Get distinct dates with logs for a user within a range.
   */
  getLoggedDates(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): ResultAsync<Date[], DomainError>;

  /**
   * Get total calories for a user on a specific date.
   */
  getTotalCaloriesForDate(
    userId: string,
    date: Date,
  ): ResultAsync<number, DomainError>;
}

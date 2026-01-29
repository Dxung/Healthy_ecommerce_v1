import { MealType } from 'src/database/typeorm/entities/meal-plan/enums/meal-type.enum';
import { DailyMealLog } from './daily-meal-log.model';
import { ExerciseLog } from './exercise-log.model';

/**
 * Computed model for daily nutrition summary.
 * Not persisted - calculated from meal logs and exercise logs.
 */
export interface MealTypeSummary {
  mealType: MealType;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  logs: DailyMealLog[];
}

export class DailySummary {
  constructor(
    private readonly _date: Date,
    private readonly _mealLogs: DailyMealLog[],
    private readonly _exerciseLogs: ExerciseLog[],
    private readonly _calorieTarget: number | null,
  ) {}

  // ======================== COMPUTED PROPERTIES ========================

  /**
   * Total calories consumed from all meals.
   */
  get totalCaloriesConsumed(): number {
    return this._mealLogs.reduce((sum, log) => sum + log.caloriesLogged, 0);
  }

  /**
   * Total calories burned from exercise.
   */
  get totalCaloriesBurned(): number {
    return this._exerciseLogs.reduce((sum, log) => sum + log.caloriesBurned, 0);
  }

  /**
   * Net calories (consumed - burned).
   */
  get netCalories(): number {
    return this.totalCaloriesConsumed - this.totalCaloriesBurned;
  }

  /**
   * Remaining calories (target - net).
   */
  get remainingCalories(): number | null {
    if (this._calorieTarget === null) return null;
    return this._calorieTarget - this.netCalories;
  }

  /**
   * Progress percentage toward calorie target.
   */
  get progressPercentage(): number | null {
    if (this._calorieTarget === null || this._calorieTarget === 0) return null;
    return Math.min((this.netCalories / this._calorieTarget) * 100, 100);
  }

  /**
   * Total protein consumed.
   */
  get totalProtein(): number {
    return this._mealLogs.reduce((sum, log) => sum + (log.proteinLogged ?? 0), 0);
  }

  /**
   * Total carbohydrates consumed.
   */
  get totalCarbs(): number {
    return this._mealLogs.reduce((sum, log) => sum + (log.carbsLogged ?? 0), 0);
  }

  /**
   * Total fat consumed.
   */
  get totalFat(): number {
    return this._mealLogs.reduce((sum, log) => sum + (log.fatLogged ?? 0), 0);
  }

  /**
   * Total fiber consumed.
   */
  get totalFiber(): number {
    return this._mealLogs.reduce((sum, log) => sum + (log.fiberLogged ?? 0), 0);
  }

  /**
   * Total sugar consumed.
   */
  get totalSugar(): number {
    return this._mealLogs.reduce((sum, log) => sum + (log.sugarLogged ?? 0), 0);
  }

  /**
   * Total sodium consumed.
   */
  get totalSodium(): number {
    return this._mealLogs.reduce((sum, log) => sum + (log.sodiumLogged ?? 0), 0);
  }

  /**
   * Get meals grouped by meal type.
   */
  getMealsByType(): MealTypeSummary[] {
    const mealTypes = [
      MealType.BREAKFAST,
      MealType.MORNING_SNACK,
      MealType.LUNCH,
      MealType.AFTERNOON_SNACK,
      MealType.DINNER,
      MealType.EVENING_SNACK,
    ];

    return mealTypes.map((mealType) => {
      const logs = this._mealLogs.filter((log) => log.mealType === mealType);
      return {
        mealType,
        totalCalories: logs.reduce((sum, log) => sum + log.caloriesLogged, 0),
        totalProtein: logs.reduce((sum, log) => sum + (log.proteinLogged ?? 0), 0),
        totalCarbs: logs.reduce((sum, log) => sum + (log.carbsLogged ?? 0), 0),
        totalFat: logs.reduce((sum, log) => sum + (log.fatLogged ?? 0), 0),
        logs,
      };
    });
  }

  /**
   * Get macros distribution percentages.
   */
  getMacrosDistribution(): { protein: number; carbs: number; fat: number } {
    const totalMacroCalories =
      (this.totalProtein * 4) + (this.totalCarbs * 4) + (this.totalFat * 9);

    if (totalMacroCalories === 0) {
      return { protein: 0, carbs: 0, fat: 0 };
    }

    return {
      protein: Math.round((this.totalProtein * 4 / totalMacroCalories) * 100),
      carbs: Math.round((this.totalCarbs * 4 / totalMacroCalories) * 100),
      fat: Math.round((this.totalFat * 9 / totalMacroCalories) * 100),
    };
  }

  // ======================== GETTERS ========================

  get date(): Date {
    return this._date;
  }

  get mealLogs(): DailyMealLog[] {
    return this._mealLogs;
  }

  get exerciseLogs(): ExerciseLog[] {
    return this._exerciseLogs;
  }

  get calorieTarget(): number | null {
    return this._calorieTarget;
  }
}

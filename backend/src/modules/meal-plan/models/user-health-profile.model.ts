import { v7 as uuidv7 } from 'uuid';
import { GoalType } from 'src/database/typeorm/entities/meal-plan/enums/goal-type.enum';
import { ActivityLevel } from 'src/database/typeorm/entities/meal-plan/enums/activity-level.enum';
import { Gender } from 'src/database/typeorm/entities/meal-plan/enums/gender.enum';

/**
 * Domain model for UserHealthProfile.
 * Stores user's physical attributes and calorie goals for TDEE calculation.
 */
export class UserHealthProfile {
  constructor(
    private readonly _id: string,
    private readonly _userId: string,
    private _weightKg: number | null,
    private _heightCm: number | null,
    private _birthDate: Date | null,
    private _gender: Gender | null,
    private _activityLevel: ActivityLevel,
    private _goalType: GoalType,
    private _calorieTarget: number | null,
    private _isCalorieTargetManual: boolean,
    private _currentStreak: number,
    private _longestStreak: number,
    private _lastLogDate: Date | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  // ======================== FACTORY METHODS ========================

  static create(userId: string): UserHealthProfile {
    const now = new Date();
    return new UserHealthProfile(
      uuidv7(),
      userId,
      null,
      null,
      null,
      null,
      ActivityLevel.SEDENTARY,
      GoalType.MAINTAIN,
      null,
      false,
      0,
      0,
      null,
      now,
      now,
    );
  }

  // ======================== BUSINESS LOGIC ========================

  /**
   * Calculate age from birth date.
   */
  getAge(): number | null {
    if (!this._birthDate) return null;
    const today = new Date();
    let age = today.getFullYear() - this._birthDate.getFullYear();
    const monthDiff = today.getMonth() - this._birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < this._birthDate.getDate())
    ) {
      age--;
    }
    return age;
  }

  /**
   * Calculate BMR using Mifflin-St Jeor equation.
   * BMR = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) + s
   * s = +5 (male), -161 (female)
   */
  calculateBMR(): number | null {
    const age = this.getAge();
    if (!this._weightKg || !this._heightCm || !age || !this._gender) {
      return null;
    }

    const s = this._gender === Gender.MALE ? 5 : -161;
    return 10 * this._weightKg + 6.25 * this._heightCm - 5 * age + s;
  }

  /**
   * Get activity multiplier for TDEE calculation.
   */
  getActivityMultiplier(): number {
    switch (this._activityLevel) {
      case ActivityLevel.SEDENTARY:
        return 1.2;
      case ActivityLevel.LIGHTLY_ACTIVE:
        return 1.375;
      case ActivityLevel.MODERATELY_ACTIVE:
        return 1.55;
      case ActivityLevel.VERY_ACTIVE:
        return 1.725;
      default:
        return 1.2;
    }
  }

  /**
   * Get goal adjustment for calorie target.
   */
  getGoalAdjustment(): number {
    switch (this._goalType) {
      case GoalType.LOSE:
        return -500;
      case GoalType.GAIN:
        return 300;
      case GoalType.MAINTAIN:
      default:
        return 0;
    }
  }

  /**
   * Calculate TDEE (Total Daily Energy Expenditure).
   * TDEE = BMR * activity_multiplier + goal_adjustment
   */
  calculateTDEE(): number | null {
    const bmr = this.calculateBMR();
    if (!bmr) return null;

    const tdee = bmr * this.getActivityMultiplier() + this.getGoalAdjustment();
    return Math.round(tdee);
  }

  /**
   * Get effective calorie target (manual or calculated).
   */
  getEffectiveCalorieTarget(): number | null {
    if (this._isCalorieTargetManual && this._calorieTarget !== null) {
      return this._calorieTarget;
    }
    return this.calculateTDEE();
  }

  /**
   * Update streak based on log date.
   */
  updateStreak(logDate: Date): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const logDay = new Date(logDate);
    logDay.setHours(0, 0, 0, 0);

    if (this._lastLogDate) {
      const lastLog = new Date(this._lastLogDate);
      lastLog.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor(
        (logDay.getTime() - lastLog.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysDiff === 1) {
        // Consecutive day
        this._currentStreak++;
      } else if (daysDiff > 1) {
        // Gap > 1 day, reset streak
        this._currentStreak = 1;
      }
      // daysDiff === 0 means same day, no change
    } else {
      // First log
      this._currentStreak = 1;
    }

    // Update longest streak
    if (this._currentStreak > this._longestStreak) {
      this._longestStreak = this._currentStreak;
    }

    this._lastLogDate = logDay;
    this._updatedAt = new Date();
  }

  // ======================== UPDATE METHODS ========================

  updatePhysicalAttributes(params: {
    weightKg?: number | null;
    heightCm?: number | null;
    birthDate?: Date | null;
    gender?: Gender | null;
    activityLevel?: ActivityLevel;
  }): void {
    if (params.weightKg !== undefined) this._weightKg = params.weightKg;
    if (params.heightCm !== undefined) this._heightCm = params.heightCm;
    if (params.birthDate !== undefined) this._birthDate = params.birthDate;
    if (params.gender !== undefined) this._gender = params.gender;
    if (params.activityLevel !== undefined)
      this._activityLevel = params.activityLevel;
    this._updatedAt = new Date();
  }

  updateGoals(params: {
    goalType?: GoalType;
    calorieTarget?: number | null;
    isCalorieTargetManual?: boolean;
  }): void {
    if (params.goalType !== undefined) this._goalType = params.goalType;
    if (params.calorieTarget !== undefined)
      this._calorieTarget = params.calorieTarget;
    if (params.isCalorieTargetManual !== undefined)
      this._isCalorieTargetManual = params.isCalorieTargetManual;
    this._updatedAt = new Date();
  }

  // ======================== GETTERS ========================

  get id(): string {
    return this._id;
  }

  get userId(): string {
    return this._userId;
  }

  get weightKg(): number | null {
    return this._weightKg;
  }

  get heightCm(): number | null {
    return this._heightCm;
  }

  get birthDate(): Date | null {
    return this._birthDate;
  }

  get gender(): Gender | null {
    return this._gender;
  }

  get activityLevel(): ActivityLevel {
    return this._activityLevel;
  }

  get goalType(): GoalType {
    return this._goalType;
  }

  get calorieTarget(): number | null {
    return this._calorieTarget;
  }

  get isCalorieTargetManual(): boolean {
    return this._isCalorieTargetManual;
  }

  get currentStreak(): number {
    return this._currentStreak;
  }

  get longestStreak(): number {
    return this._longestStreak;
  }

  get lastLogDate(): Date | null {
    return this._lastLogDate;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}

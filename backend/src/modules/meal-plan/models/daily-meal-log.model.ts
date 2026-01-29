import { v7 as uuidv7 } from 'uuid';
import { MealType } from 'src/database/typeorm/entities/meal-plan/enums/meal-type.enum';
import { MealSourceType } from 'src/database/typeorm/entities/meal-plan/enums/meal-source-type.enum';

/**
 * Domain model for DailyMealLog.
 * Individual meal entries per day with nutrition snapshots.
 */
export class DailyMealLog {
  constructor(
    private readonly _id: string,
    private readonly _userId: string,
    private _logDate: Date,
    private _mealType: MealType,
    private _sourceType: MealSourceType,
    private _productId: string | null,
    private _presetId: string | null,
    private _foodName: string,
    private _quantity: number,
    private _servingSizeSnapshot: number | null,
    private _servingUnitSnapshot: string | null,
    private _caloriesLogged: number,
    private _proteinLogged: number | null,
    private _carbsLogged: number | null,
    private _fatLogged: number | null,
    private _fiberLogged: number | null,
    private _sugarLogged: number | null,
    private _sodiumLogged: number | null,
    private _notes: string | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  // ======================== FACTORY METHODS ========================

  /**
   * Create a meal log from a product.
   */
  static createFromProduct(params: {
    userId: string;
    logDate: Date;
    mealType: MealType;
    productId: string;
    foodName: string;
    quantity: number;
    servingSize: number;
    servingUnit: string;
    caloriesPerServing: number;
    proteinPerServing?: number | null;
    carbsPerServing?: number | null;
    fatPerServing?: number | null;
    fiberPerServing?: number | null;
    sugarPerServing?: number | null;
    sodiumPerServing?: number | null;
    notes?: string | null;
  }): DailyMealLog {
    const now = new Date();
    return new DailyMealLog(
      uuidv7(),
      params.userId,
      params.logDate,
      params.mealType,
      MealSourceType.PRODUCT,
      params.productId,
      null,
      params.foodName,
      params.quantity,
      params.servingSize,
      params.servingUnit,
      params.caloriesPerServing * params.quantity,
      params.proteinPerServing ? params.proteinPerServing * params.quantity : null,
      params.carbsPerServing ? params.carbsPerServing * params.quantity : null,
      params.fatPerServing ? params.fatPerServing * params.quantity : null,
      params.fiberPerServing ? params.fiberPerServing * params.quantity : null,
      params.sugarPerServing ? params.sugarPerServing * params.quantity : null,
      params.sodiumPerServing ? params.sodiumPerServing * params.quantity : null,
      params.notes ?? null,
      now,
      now,
    );
  }

  /**
   * Create a meal log from a preset.
   */
  static createFromPreset(params: {
    userId: string;
    logDate: Date;
    mealType: MealType;
    presetId: string;
    foodName: string;
    quantity: number;
    servingSize: number;
    servingUnit: string;
    caloriesPerServing: number;
    proteinPerServing?: number | null;
    carbsPerServing?: number | null;
    fatPerServing?: number | null;
    fiberPerServing?: number | null;
    sugarPerServing?: number | null;
    sodiumPerServing?: number | null;
    notes?: string | null;
  }): DailyMealLog {
    const now = new Date();
    return new DailyMealLog(
      uuidv7(),
      params.userId,
      params.logDate,
      params.mealType,
      MealSourceType.PRESET,
      null,
      params.presetId,
      params.foodName,
      params.quantity,
      params.servingSize,
      params.servingUnit,
      params.caloriesPerServing * params.quantity,
      params.proteinPerServing ? params.proteinPerServing * params.quantity : null,
      params.carbsPerServing ? params.carbsPerServing * params.quantity : null,
      params.fatPerServing ? params.fatPerServing * params.quantity : null,
      params.fiberPerServing ? params.fiberPerServing * params.quantity : null,
      params.sugarPerServing ? params.sugarPerServing * params.quantity : null,
      params.sodiumPerServing ? params.sodiumPerServing * params.quantity : null,
      params.notes ?? null,
      now,
      now,
    );
  }

  /**
   * Create a custom meal log.
   */
  static createCustom(params: {
    userId: string;
    logDate: Date;
    mealType: MealType;
    foodName: string;
    quantity: number;
    servingSize?: number | null;
    servingUnit?: string | null;
    calories: number;
    protein?: number | null;
    carbs?: number | null;
    fat?: number | null;
    fiber?: number | null;
    sugar?: number | null;
    sodium?: number | null;
    notes?: string | null;
  }): DailyMealLog {
    const now = new Date();
    return new DailyMealLog(
      uuidv7(),
      params.userId,
      params.logDate,
      params.mealType,
      MealSourceType.CUSTOM,
      null,
      null,
      params.foodName,
      params.quantity,
      params.servingSize ?? null,
      params.servingUnit ?? null,
      params.calories,
      params.protein ?? null,
      params.carbs ?? null,
      params.fat ?? null,
      params.fiber ?? null,
      params.sugar ?? null,
      params.sodium ?? null,
      params.notes ?? null,
      now,
      now,
    );
  }

  /**
   * Create a quick add meal log (just calories).
   */
  static createQuickAdd(params: {
    userId: string;
    logDate: Date;
    mealType: MealType;
    foodName: string;
    calories: number;
    notes?: string | null;
  }): DailyMealLog {
    const now = new Date();
    return new DailyMealLog(
      uuidv7(),
      params.userId,
      params.logDate,
      params.mealType,
      MealSourceType.QUICK,
      null,
      null,
      params.foodName,
      1,
      null,
      null,
      params.calories,
      null,
      null,
      null,
      null,
      null,
      null,
      params.notes ?? null,
      now,
      now,
    );
  }

  // ======================== BUSINESS LOGIC ========================

  /**
   * Check if log belongs to user.
   */
  belongsToUser(userId: string): boolean {
    return this._userId === userId;
  }

  // ======================== UPDATE METHODS ========================

  updateQuantity(quantity: number, caloriesPerServing: number, params?: {
    proteinPerServing?: number | null;
    carbsPerServing?: number | null;
    fatPerServing?: number | null;
    fiberPerServing?: number | null;
    sugarPerServing?: number | null;
    sodiumPerServing?: number | null;
  }): void {
    this._quantity = quantity;
    this._caloriesLogged = caloriesPerServing * quantity;
    if (params?.proteinPerServing !== undefined) {
      this._proteinLogged = params.proteinPerServing ? params.proteinPerServing * quantity : null;
    }
    if (params?.carbsPerServing !== undefined) {
      this._carbsLogged = params.carbsPerServing ? params.carbsPerServing * quantity : null;
    }
    if (params?.fatPerServing !== undefined) {
      this._fatLogged = params.fatPerServing ? params.fatPerServing * quantity : null;
    }
    if (params?.fiberPerServing !== undefined) {
      this._fiberLogged = params.fiberPerServing ? params.fiberPerServing * quantity : null;
    }
    if (params?.sugarPerServing !== undefined) {
      this._sugarLogged = params.sugarPerServing ? params.sugarPerServing * quantity : null;
    }
    if (params?.sodiumPerServing !== undefined) {
      this._sodiumLogged = params.sodiumPerServing ? params.sodiumPerServing * quantity : null;
    }
    this._updatedAt = new Date();
  }

  updateNotes(notes: string | null): void {
    this._notes = notes;
    this._updatedAt = new Date();
  }

  // ======================== GETTERS ========================

  get id(): string {
    return this._id;
  }

  get userId(): string {
    return this._userId;
  }

  get logDate(): Date {
    return this._logDate;
  }

  get mealType(): MealType {
    return this._mealType;
  }

  get sourceType(): MealSourceType {
    return this._sourceType;
  }

  get productId(): string | null {
    return this._productId;
  }

  get presetId(): string | null {
    return this._presetId;
  }

  get foodName(): string {
    return this._foodName;
  }

  get quantity(): number {
    return this._quantity;
  }

  get servingSizeSnapshot(): number | null {
    return this._servingSizeSnapshot;
  }

  get servingUnitSnapshot(): string | null {
    return this._servingUnitSnapshot;
  }

  get caloriesLogged(): number {
    return this._caloriesLogged;
  }

  get proteinLogged(): number | null {
    return this._proteinLogged;
  }

  get carbsLogged(): number | null {
    return this._carbsLogged;
  }

  get fatLogged(): number | null {
    return this._fatLogged;
  }

  get fiberLogged(): number | null {
    return this._fiberLogged;
  }

  get sugarLogged(): number | null {
    return this._sugarLogged;
  }

  get sodiumLogged(): number | null {
    return this._sodiumLogged;
  }

  get notes(): string | null {
    return this._notes;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}

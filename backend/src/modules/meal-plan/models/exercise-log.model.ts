import { v7 as uuidv7 } from 'uuid';

/**
 * Domain model for ExerciseLog.
 * Exercise entries with calories burned.
 */
export class ExerciseLog {
  constructor(
    private readonly _id: string,
    private readonly _userId: string,
    private _logDate: Date,
    private _exerciseName: string,
    private _durationMinutes: number,
    private _caloriesBurned: number,
    private _notes: string | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  // ======================== FACTORY METHODS ========================

  static create(params: {
    userId: string;
    logDate: Date;
    exerciseName: string;
    durationMinutes: number;
    caloriesBurned: number;
    notes?: string | null;
  }): ExerciseLog {
    const now = new Date();
    return new ExerciseLog(
      uuidv7(),
      params.userId,
      params.logDate,
      params.exerciseName,
      params.durationMinutes,
      params.caloriesBurned,
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

  updateExercise(params: {
    exerciseName?: string;
    durationMinutes?: number;
    caloriesBurned?: number;
    notes?: string | null;
  }): void {
    if (params.exerciseName !== undefined) this._exerciseName = params.exerciseName;
    if (params.durationMinutes !== undefined) this._durationMinutes = params.durationMinutes;
    if (params.caloriesBurned !== undefined) this._caloriesBurned = params.caloriesBurned;
    if (params.notes !== undefined) this._notes = params.notes;
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

  get exerciseName(): string {
    return this._exerciseName;
  }

  get durationMinutes(): number {
    return this._durationMinutes;
  }

  get caloriesBurned(): number {
    return this._caloriesBurned;
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

import { v7 as uuidv7 } from 'uuid';
import { PresetSource } from 'src/database/typeorm/entities/meal-plan/enums/preset-source.enum';

/**
 * Domain model for FoodPreset.
 * Custom/community meal presets with nutrition info.
 */
export class FoodPreset {
  constructor(
    private readonly _id: string,
    private readonly _creatorId: string,
    private _name: string,
    private _description: string | null,
    private _imageUrl: string | null,
    private _servingSize: number,
    private _servingUnit: string,
    private _calories: number,
    private _protein: number | null,
    private _carbohydrates: number | null,
    private _fat: number | null,
    private _fiber: number | null,
    private _sugar: number | null,
    private _sodium: number | null,
    private _source: PresetSource,
    private _isPublic: boolean,
    private _upvoteCount: number,
    private _downvoteCount: number,
    private _useCount: number,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  // ======================== FACTORY METHODS ========================

  static create(params: {
    creatorId: string;
    name: string;
    description?: string | null;
    imageUrl?: string | null;
    servingSize: number;
    servingUnit: string;
    calories: number;
    protein?: number | null;
    carbohydrates?: number | null;
    fat?: number | null;
    fiber?: number | null;
    sugar?: number | null;
    sodium?: number | null;
    source?: PresetSource;
    isPublic?: boolean;
  }): FoodPreset {
    const now = new Date();
    return new FoodPreset(
      uuidv7(),
      params.creatorId,
      params.name,
      params.description ?? null,
      params.imageUrl ?? null,
      params.servingSize,
      params.servingUnit,
      params.calories,
      params.protein ?? null,
      params.carbohydrates ?? null,
      params.fat ?? null,
      params.fiber ?? null,
      params.sugar ?? null,
      params.sodium ?? null,
      params.source ?? PresetSource.USER,
      params.isPublic ?? false,
      0,
      0,
      0,
      now,
      now,
    );
  }

  // ======================== BUSINESS LOGIC ========================

  /**
   * Check if user can edit this preset.
   */
  canBeEditedBy(userId: string): boolean {
    return this._creatorId === userId;
  }

  /**
   * Get net vote score.
   */
  getNetVotes(): number {
    return this._upvoteCount - this._downvoteCount;
  }

  /**
   * Increment use count when preset is used in a meal log.
   */
  incrementUseCount(): void {
    this._useCount++;
    this._updatedAt = new Date();
  }

  /**
   * Update vote counts.
   */
  updateVoteCounts(upvotes: number, downvotes: number): void {
    this._upvoteCount = upvotes;
    this._downvoteCount = downvotes;
    this._updatedAt = new Date();
  }

  /**
   * Reset votes to 0 (used when preset is edited).
   */
  resetVotes(): void {
    this._upvoteCount = 0;
    this._downvoteCount = 0;
    this._updatedAt = new Date();
  }

  // ======================== UPDATE METHODS ========================

  updateInfo(params: {
    name?: string;
    description?: string | null;
    imageUrl?: string | null;
    isPublic?: boolean;
  }): void {
    if (params.name !== undefined) this._name = params.name;
    if (params.description !== undefined)
      this._description = params.description;
    if (params.imageUrl !== undefined) this._imageUrl = params.imageUrl;
    if (params.isPublic !== undefined) this._isPublic = params.isPublic;
    this._updatedAt = new Date();
  }

  updateNutrition(params: {
    servingSize?: number;
    servingUnit?: string;
    calories?: number;
    protein?: number | null;
    carbohydrates?: number | null;
    fat?: number | null;
    fiber?: number | null;
    sugar?: number | null;
    sodium?: number | null;
  }): void {
    if (params.servingSize !== undefined)
      this._servingSize = params.servingSize;
    if (params.servingUnit !== undefined)
      this._servingUnit = params.servingUnit;
    if (params.calories !== undefined) this._calories = params.calories;
    if (params.protein !== undefined) this._protein = params.protein;
    if (params.carbohydrates !== undefined)
      this._carbohydrates = params.carbohydrates;
    if (params.fat !== undefined) this._fat = params.fat;
    if (params.fiber !== undefined) this._fiber = params.fiber;
    if (params.sugar !== undefined) this._sugar = params.sugar;
    if (params.sodium !== undefined) this._sodium = params.sodium;
    this._updatedAt = new Date();
  }

  // ======================== GETTERS ========================

  get id(): string {
    return this._id;
  }

  get creatorId(): string {
    return this._creatorId;
  }

  get name(): string {
    return this._name;
  }

  get description(): string | null {
    return this._description;
  }

  get imageUrl(): string | null {
    return this._imageUrl;
  }

  get servingSize(): number {
    return this._servingSize;
  }

  get servingUnit(): string {
    return this._servingUnit;
  }

  get calories(): number {
    return this._calories;
  }

  get protein(): number | null {
    return this._protein;
  }

  get carbohydrates(): number | null {
    return this._carbohydrates;
  }

  get fat(): number | null {
    return this._fat;
  }

  get fiber(): number | null {
    return this._fiber;
  }

  get sugar(): number | null {
    return this._sugar;
  }

  get sodium(): number | null {
    return this._sodium;
  }

  get source(): PresetSource {
    return this._source;
  }

  get isPublic(): boolean {
    return this._isPublic;
  }

  get upvoteCount(): number {
    return this._upvoteCount;
  }

  get downvoteCount(): number {
    return this._downvoteCount;
  }

  get useCount(): number {
    return this._useCount;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}

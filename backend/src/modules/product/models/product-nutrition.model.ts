import { v7 as uuidv7 } from 'uuid';

/**
 * Domain model for ProductNutrition.
 * Stores nutritional information per serving for products.
 */
export class ProductNutrition {
  constructor(
    private readonly _id: string,
    private readonly _productId: string,
    private _servingSize: number,
    private _servingUnit: string,
    private _servingsPerContainer: number | null,
    private _calories: number | null,
    private _protein: number | null,
    private _carbohydrates: number | null,
    private _fat: number | null,
    private _saturatedFat: number | null,
    private _transFat: number | null,
    private _cholesterol: number | null,
    private _sodium: number | null,
    private _fiber: number | null,
    private _sugar: number | null,
    private _addedSugar: number | null,
    private _vitaminA: number | null,
    private _vitaminC: number | null,
    private _vitaminD: number | null,
    private _vitaminE: number | null,
    private _vitaminK: number | null,
    private _vitaminB1: number | null,
    private _vitaminB2: number | null,
    private _vitaminB3: number | null,
    private _vitaminB6: number | null,
    private _vitaminB12: number | null,
    private _calcium: number | null,
    private _iron: number | null,
    private _potassium: number | null,
    private _magnesium: number | null,
    private _zinc: number | null,
    private _otherNutrients: Record<string, number> | null,
    private _allergens: string[] | null,
    private _dietaryInfo: string[] | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  // ======================== FACTORY METHODS ========================

  static create(params: {
    productId: string;
    servingSize: number;
    servingUnit: string;
    servingsPerContainer?: number | null;
    calories?: number | null;
    protein?: number | null;
    carbohydrates?: number | null;
    fat?: number | null;
    saturatedFat?: number | null;
    transFat?: number | null;
    cholesterol?: number | null;
    sodium?: number | null;
    fiber?: number | null;
    sugar?: number | null;
    addedSugar?: number | null;
    vitaminA?: number | null;
    vitaminC?: number | null;
    vitaminD?: number | null;
    vitaminE?: number | null;
    vitaminK?: number | null;
    vitaminB1?: number | null;
    vitaminB2?: number | null;
    vitaminB3?: number | null;
    vitaminB6?: number | null;
    vitaminB12?: number | null;
    calcium?: number | null;
    iron?: number | null;
    potassium?: number | null;
    magnesium?: number | null;
    zinc?: number | null;
    otherNutrients?: Record<string, number> | null;
    allergens?: string[] | null;
    dietaryInfo?: string[] | null;
  }): ProductNutrition {
    const now = new Date();
    return new ProductNutrition(
      uuidv7(),
      params.productId,
      params.servingSize,
      params.servingUnit,
      params.servingsPerContainer ?? null,
      params.calories ?? null,
      params.protein ?? null,
      params.carbohydrates ?? null,
      params.fat ?? null,
      params.saturatedFat ?? null,
      params.transFat ?? null,
      params.cholesterol ?? null,
      params.sodium ?? null,
      params.fiber ?? null,
      params.sugar ?? null,
      params.addedSugar ?? null,
      params.vitaminA ?? null,
      params.vitaminC ?? null,
      params.vitaminD ?? null,
      params.vitaminE ?? null,
      params.vitaminK ?? null,
      params.vitaminB1 ?? null,
      params.vitaminB2 ?? null,
      params.vitaminB3 ?? null,
      params.vitaminB6 ?? null,
      params.vitaminB12 ?? null,
      params.calcium ?? null,
      params.iron ?? null,
      params.potassium ?? null,
      params.magnesium ?? null,
      params.zinc ?? null,
      params.otherNutrients ?? null,
      params.allergens ?? null,
      params.dietaryInfo ?? null,
      now,
      now,
    );
  }

  // ======================== UPDATE METHODS ========================

  updateNutrition(params: {
    servingSize?: number;
    servingUnit?: string;
    servingsPerContainer?: number | null;
    calories?: number | null;
    protein?: number | null;
    carbohydrates?: number | null;
    fat?: number | null;
    saturatedFat?: number | null;
    transFat?: number | null;
    cholesterol?: number | null;
    sodium?: number | null;
    fiber?: number | null;
    sugar?: number | null;
    addedSugar?: number | null;
    vitaminA?: number | null;
    vitaminC?: number | null;
    vitaminD?: number | null;
    vitaminE?: number | null;
    vitaminK?: number | null;
    vitaminB1?: number | null;
    vitaminB2?: number | null;
    vitaminB3?: number | null;
    vitaminB6?: number | null;
    vitaminB12?: number | null;
    calcium?: number | null;
    iron?: number | null;
    potassium?: number | null;
    magnesium?: number | null;
    zinc?: number | null;
    otherNutrients?: Record<string, number> | null;
    allergens?: string[] | null;
    dietaryInfo?: string[] | null;
  }): void {
    if (params.servingSize !== undefined) this._servingSize = params.servingSize;
    if (params.servingUnit !== undefined) this._servingUnit = params.servingUnit;
    if (params.servingsPerContainer !== undefined) this._servingsPerContainer = params.servingsPerContainer;
    if (params.calories !== undefined) this._calories = params.calories;
    if (params.protein !== undefined) this._protein = params.protein;
    if (params.carbohydrates !== undefined) this._carbohydrates = params.carbohydrates;
    if (params.fat !== undefined) this._fat = params.fat;
    if (params.saturatedFat !== undefined) this._saturatedFat = params.saturatedFat;
    if (params.transFat !== undefined) this._transFat = params.transFat;
    if (params.cholesterol !== undefined) this._cholesterol = params.cholesterol;
    if (params.sodium !== undefined) this._sodium = params.sodium;
    if (params.fiber !== undefined) this._fiber = params.fiber;
    if (params.sugar !== undefined) this._sugar = params.sugar;
    if (params.addedSugar !== undefined) this._addedSugar = params.addedSugar;
    if (params.vitaminA !== undefined) this._vitaminA = params.vitaminA;
    if (params.vitaminC !== undefined) this._vitaminC = params.vitaminC;
    if (params.vitaminD !== undefined) this._vitaminD = params.vitaminD;
    if (params.vitaminE !== undefined) this._vitaminE = params.vitaminE;
    if (params.vitaminK !== undefined) this._vitaminK = params.vitaminK;
    if (params.vitaminB1 !== undefined) this._vitaminB1 = params.vitaminB1;
    if (params.vitaminB2 !== undefined) this._vitaminB2 = params.vitaminB2;
    if (params.vitaminB3 !== undefined) this._vitaminB3 = params.vitaminB3;
    if (params.vitaminB6 !== undefined) this._vitaminB6 = params.vitaminB6;
    if (params.vitaminB12 !== undefined) this._vitaminB12 = params.vitaminB12;
    if (params.calcium !== undefined) this._calcium = params.calcium;
    if (params.iron !== undefined) this._iron = params.iron;
    if (params.potassium !== undefined) this._potassium = params.potassium;
    if (params.magnesium !== undefined) this._magnesium = params.magnesium;
    if (params.zinc !== undefined) this._zinc = params.zinc;
    if (params.otherNutrients !== undefined) this._otherNutrients = params.otherNutrients;
    if (params.allergens !== undefined) this._allergens = params.allergens;
    if (params.dietaryInfo !== undefined) this._dietaryInfo = params.dietaryInfo;
    this._updatedAt = new Date();
  }

  // ======================== GETTERS ========================

  get id(): string {
    return this._id;
  }

  get productId(): string {
    return this._productId;
  }

  get servingSize(): number {
    return this._servingSize;
  }

  get servingUnit(): string {
    return this._servingUnit;
  }

  get servingsPerContainer(): number | null {
    return this._servingsPerContainer;
  }

  get calories(): number | null {
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

  get saturatedFat(): number | null {
    return this._saturatedFat;
  }

  get transFat(): number | null {
    return this._transFat;
  }

  get cholesterol(): number | null {
    return this._cholesterol;
  }

  get sodium(): number | null {
    return this._sodium;
  }

  get fiber(): number | null {
    return this._fiber;
  }

  get sugar(): number | null {
    return this._sugar;
  }

  get addedSugar(): number | null {
    return this._addedSugar;
  }

  get vitaminA(): number | null {
    return this._vitaminA;
  }

  get vitaminC(): number | null {
    return this._vitaminC;
  }

  get vitaminD(): number | null {
    return this._vitaminD;
  }

  get vitaminE(): number | null {
    return this._vitaminE;
  }

  get vitaminK(): number | null {
    return this._vitaminK;
  }

  get vitaminB1(): number | null {
    return this._vitaminB1;
  }

  get vitaminB2(): number | null {
    return this._vitaminB2;
  }

  get vitaminB3(): number | null {
    return this._vitaminB3;
  }

  get vitaminB6(): number | null {
    return this._vitaminB6;
  }

  get vitaminB12(): number | null {
    return this._vitaminB12;
  }

  get calcium(): number | null {
    return this._calcium;
  }

  get iron(): number | null {
    return this._iron;
  }

  get potassium(): number | null {
    return this._potassium;
  }

  get magnesium(): number | null {
    return this._magnesium;
  }

  get zinc(): number | null {
    return this._zinc;
  }

  get otherNutrients(): Record<string, number> | null {
    return this._otherNutrients;
  }

  get allergens(): string[] | null {
    return this._allergens;
  }

  get dietaryInfo(): string[] | null {
    return this._dietaryInfo;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}

import { ORMProductNutrition } from '../entities/product/orm.product-nutrition.entity';
import { ProductNutrition } from 'src/modules/product/models/product-nutrition.model';

/**
 * Mapper for converting between ORM entity and domain model for ProductNutrition.
 */
export class ORMProductNutritionMapper {
  /**
   * Converts an ORM entity to a domain model.
   */
  static toDomain(orm: ORMProductNutrition): ProductNutrition {
    return new ProductNutrition(
      orm.id,
      orm.productId,
      parseFloat(orm.servingSize),
      orm.servingUnit,
      orm.servingsPerContainer ? parseFloat(orm.servingsPerContainer) : null,
      orm.calories ? parseFloat(orm.calories) : null,
      orm.protein ? parseFloat(orm.protein) : null,
      orm.carbohydrates ? parseFloat(orm.carbohydrates) : null,
      orm.fat ? parseFloat(orm.fat) : null,
      orm.saturatedFat ? parseFloat(orm.saturatedFat) : null,
      orm.transFat ? parseFloat(orm.transFat) : null,
      orm.cholesterol ? parseFloat(orm.cholesterol) : null,
      orm.sodium ? parseFloat(orm.sodium) : null,
      orm.fiber ? parseFloat(orm.fiber) : null,
      orm.sugar ? parseFloat(orm.sugar) : null,
      orm.addedSugar ? parseFloat(orm.addedSugar) : null,
      orm.vitaminA ? parseFloat(orm.vitaminA) : null,
      orm.vitaminC ? parseFloat(orm.vitaminC) : null,
      orm.vitaminD ? parseFloat(orm.vitaminD) : null,
      orm.vitaminE ? parseFloat(orm.vitaminE) : null,
      orm.vitaminK ? parseFloat(orm.vitaminK) : null,
      orm.vitaminB1 ? parseFloat(orm.vitaminB1) : null,
      orm.vitaminB2 ? parseFloat(orm.vitaminB2) : null,
      orm.vitaminB3 ? parseFloat(orm.vitaminB3) : null,
      orm.vitaminB6 ? parseFloat(orm.vitaminB6) : null,
      orm.vitaminB12 ? parseFloat(orm.vitaminB12) : null,
      orm.calcium ? parseFloat(orm.calcium) : null,
      orm.iron ? parseFloat(orm.iron) : null,
      orm.potassium ? parseFloat(orm.potassium) : null,
      orm.magnesium ? parseFloat(orm.magnesium) : null,
      orm.zinc ? parseFloat(orm.zinc) : null,
      orm.otherNutrients,
      orm.allergens,
      orm.dietaryInfo,
      orm.createdAt,
      orm.updatedAt,
    );
  }

  /**
   * Converts a domain model to an ORM entity.
   */
  static toOrm(domain: ProductNutrition): ORMProductNutrition {
    const orm = new ORMProductNutrition();
    orm.id = domain.id;
    orm.productId = domain.productId;
    orm.servingSize = domain.servingSize.toString();
    orm.servingUnit = domain.servingUnit;
    orm.servingsPerContainer = domain.servingsPerContainer?.toString() ?? null;
    orm.calories = domain.calories?.toString() ?? null;
    orm.protein = domain.protein?.toString() ?? null;
    orm.carbohydrates = domain.carbohydrates?.toString() ?? null;
    orm.fat = domain.fat?.toString() ?? null;
    orm.saturatedFat = domain.saturatedFat?.toString() ?? null;
    orm.transFat = domain.transFat?.toString() ?? null;
    orm.cholesterol = domain.cholesterol?.toString() ?? null;
    orm.sodium = domain.sodium?.toString() ?? null;
    orm.fiber = domain.fiber?.toString() ?? null;
    orm.sugar = domain.sugar?.toString() ?? null;
    orm.addedSugar = domain.addedSugar?.toString() ?? null;
    orm.vitaminA = domain.vitaminA?.toString() ?? null;
    orm.vitaminC = domain.vitaminC?.toString() ?? null;
    orm.vitaminD = domain.vitaminD?.toString() ?? null;
    orm.vitaminE = domain.vitaminE?.toString() ?? null;
    orm.vitaminK = domain.vitaminK?.toString() ?? null;
    orm.vitaminB1 = domain.vitaminB1?.toString() ?? null;
    orm.vitaminB2 = domain.vitaminB2?.toString() ?? null;
    orm.vitaminB3 = domain.vitaminB3?.toString() ?? null;
    orm.vitaminB6 = domain.vitaminB6?.toString() ?? null;
    orm.vitaminB12 = domain.vitaminB12?.toString() ?? null;
    orm.calcium = domain.calcium?.toString() ?? null;
    orm.iron = domain.iron?.toString() ?? null;
    orm.potassium = domain.potassium?.toString() ?? null;
    orm.magnesium = domain.magnesium?.toString() ?? null;
    orm.zinc = domain.zinc?.toString() ?? null;
    orm.otherNutrients = domain.otherNutrients;
    orm.allergens = domain.allergens;
    orm.dietaryInfo = domain.dietaryInfo;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    return orm;
  }

  /**
   * Converts an array of ORM entities to domain models.
   */
  static toDomainList(ormEntities: ORMProductNutrition[]): ProductNutrition[] {
    return ormEntities.map((orm) => this.toDomain(orm));
  }
}

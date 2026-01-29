import { ORMFoodPreset } from '../entities/meal-plan';
import { FoodPreset } from 'src/modules/meal-plan/models/food-preset.model';

export class ORMFoodPresetMapper {
  static toDomain(orm: ORMFoodPreset): FoodPreset {
    return new FoodPreset(
      orm.id,
      orm.creatorId,
      orm.name,
      orm.description,
      orm.imageUrl,
      parseFloat(orm.servingSize),
      orm.servingUnit,
      parseFloat(orm.calories),
      orm.protein ? parseFloat(orm.protein) : null,
      orm.carbohydrates ? parseFloat(orm.carbohydrates) : null,
      orm.fat ? parseFloat(orm.fat) : null,
      orm.fiber ? parseFloat(orm.fiber) : null,
      orm.sugar ? parseFloat(orm.sugar) : null,
      orm.sodium ? parseFloat(orm.sodium) : null,
      orm.source,
      orm.isPublic,
      orm.upvoteCount,
      orm.downvoteCount,
      orm.useCount,
      orm.createdAt,
      orm.updatedAt,
    );
  }

  static toOrm(domain: FoodPreset): ORMFoodPreset {
    const orm = new ORMFoodPreset();
    orm.id = domain.id;
    orm.creatorId = domain.creatorId;
    orm.name = domain.name;
    orm.description = domain.description;
    orm.imageUrl = domain.imageUrl;
    orm.servingSize = domain.servingSize.toString();
    orm.servingUnit = domain.servingUnit;
    orm.calories = domain.calories.toString();
    orm.protein = domain.protein?.toString() ?? null;
    orm.carbohydrates = domain.carbohydrates?.toString() ?? null;
    orm.fat = domain.fat?.toString() ?? null;
    orm.fiber = domain.fiber?.toString() ?? null;
    orm.sugar = domain.sugar?.toString() ?? null;
    orm.sodium = domain.sodium?.toString() ?? null;
    orm.source = domain.source;
    orm.isPublic = domain.isPublic;
    orm.upvoteCount = domain.upvoteCount;
    orm.downvoteCount = domain.downvoteCount;
    orm.useCount = domain.useCount;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    return orm;
  }

  static toDomainList(ormEntities: ORMFoodPreset[]): FoodPreset[] {
    return ormEntities.map((orm) => this.toDomain(orm));
  }
}

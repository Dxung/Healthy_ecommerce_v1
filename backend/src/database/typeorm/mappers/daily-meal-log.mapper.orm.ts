import { ORMDailyMealLog } from '../entities/meal-plan';
import { DailyMealLog } from 'src/modules/meal-plan/models/daily-meal-log.model';

export class ORMDailyMealLogMapper {
  static toDomain(orm: ORMDailyMealLog): DailyMealLog {
    return new DailyMealLog(
      orm.id,
      orm.userId,
      orm.logDate,
      orm.mealType,
      orm.sourceType,
      orm.productId,
      orm.presetId,
      orm.foodName,
      parseFloat(orm.quantity),
      orm.servingSizeSnapshot ? parseFloat(orm.servingSizeSnapshot) : null,
      orm.servingUnitSnapshot,
      parseFloat(orm.caloriesLogged),
      orm.proteinLogged ? parseFloat(orm.proteinLogged) : null,
      orm.carbsLogged ? parseFloat(orm.carbsLogged) : null,
      orm.fatLogged ? parseFloat(orm.fatLogged) : null,
      orm.fiberLogged ? parseFloat(orm.fiberLogged) : null,
      orm.sugarLogged ? parseFloat(orm.sugarLogged) : null,
      orm.sodiumLogged ? parseFloat(orm.sodiumLogged) : null,
      orm.notes,
      orm.createdAt,
      orm.updatedAt,
    );
  }

  static toOrm(domain: DailyMealLog): ORMDailyMealLog {
    const orm = new ORMDailyMealLog();
    orm.id = domain.id;
    orm.userId = domain.userId;
    orm.logDate = domain.logDate;
    orm.mealType = domain.mealType;
    orm.sourceType = domain.sourceType;
    orm.productId = domain.productId;
    orm.presetId = domain.presetId;
    orm.foodName = domain.foodName;
    orm.quantity = domain.quantity.toString();
    orm.servingSizeSnapshot = domain.servingSizeSnapshot?.toString() ?? null;
    orm.servingUnitSnapshot = domain.servingUnitSnapshot;
    orm.caloriesLogged = domain.caloriesLogged.toString();
    orm.proteinLogged = domain.proteinLogged?.toString() ?? null;
    orm.carbsLogged = domain.carbsLogged?.toString() ?? null;
    orm.fatLogged = domain.fatLogged?.toString() ?? null;
    orm.fiberLogged = domain.fiberLogged?.toString() ?? null;
    orm.sugarLogged = domain.sugarLogged?.toString() ?? null;
    orm.sodiumLogged = domain.sodiumLogged?.toString() ?? null;
    orm.notes = domain.notes;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    return orm;
  }

  static toDomainList(ormEntities: ORMDailyMealLog[]): DailyMealLog[] {
    return ormEntities.map((orm) => this.toDomain(orm));
  }
}

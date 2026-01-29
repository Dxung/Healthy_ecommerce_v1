import { ORMUnitConversion } from '../entities/product';
import { UnitConversion } from 'src/modules/product/models/unit-conversion.model';

/**
 * Mapper for converting between ORM entity and domain model for UnitConversion.
 */
export class ORMUnitConversionMapper {
  /**
   * Converts an ORM entity to a domain model.
   */
  static toDomain(orm: ORMUnitConversion): UnitConversion {
    return new UnitConversion(
      orm.id,
      orm.fromUnitId,
      orm.toUnitId,
      parseFloat(orm.conversionFactor),
      orm.isActive,
      orm.createdAt,
      orm.updatedAt,
    );
  }

  /**
   * Converts a domain model to an ORM entity.
   */
  static toOrm(domain: UnitConversion): ORMUnitConversion {
    const orm = new ORMUnitConversion();
    orm.id = domain.id;
    orm.fromUnitId = domain.fromUnitId;
    orm.toUnitId = domain.toUnitId;
    orm.conversionFactor = domain.conversionFactor.toString();
    orm.isActive = domain.isActive;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    return orm;
  }

  /**
   * Converts an array of ORM entities to domain models.
   */
  static toDomainList(ormEntities: ORMUnitConversion[]): UnitConversion[] {
    return ormEntities.map((orm) => this.toDomain(orm));
  }
}

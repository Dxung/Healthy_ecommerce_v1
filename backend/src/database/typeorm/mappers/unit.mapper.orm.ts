import { ORMUnit } from '../entities/product';
import { Unit } from 'src/modules/product/models/unit.model';

/**
 * Mapper for converting between ORM entity and domain model for Unit.
 */
export class ORMUnitMapper {
  /**
   * Converts an ORM entity to a domain model.
   */
  static toDomain(orm: ORMUnit): Unit {
    return new Unit(
      orm.id,
      orm.name,
      orm.symbol,
      orm.category,
      orm.type,
      orm.isBase,
      orm.isActive,
      orm.createdAt,
      orm.updatedAt,
      orm.deletedAt,
    );
  }

  /**
   * Converts a domain model to an ORM entity.
   */
  static toOrm(domain: Unit): ORMUnit {
    const orm = new ORMUnit();
    orm.id = domain.id;
    orm.name = domain.name;
    orm.symbol = domain.symbol;
    orm.category = domain.category;
    orm.type = domain.type;
    orm.isBase = domain.isBase;
    orm.isActive = domain.isActive;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    orm.deletedAt = domain.deletedAt;
    return orm;
  }

  /**
   * Converts an array of ORM entities to domain models.
   */
  static toDomainList(ormEntities: ORMUnit[]): Unit[] {
    return ormEntities.map((orm) => this.toDomain(orm));
  }
}

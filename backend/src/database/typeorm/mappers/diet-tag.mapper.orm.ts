import { ORMDietTag } from '../entities/product';
import { DietTag } from 'src/modules/product/models/diet-tag.model';

/**
 * Mapper for converting between ORM entity and domain model for DietTag.
 */
export class ORMDietTagMapper {
  /**
   * Converts an ORM entity to a domain model.
   */
  static toDomain(orm: ORMDietTag): DietTag {
    return new DietTag(
      orm.id,
      orm.name,
      orm.slug,
      orm.description,
      orm.iconUrl,
      orm.isActive,
      orm.createdAt,
      orm.updatedAt,
    );
  }

  /**
   * Converts a domain model to an ORM entity.
   */
  static toOrm(domain: DietTag): ORMDietTag {
    const orm = new ORMDietTag();
    orm.id = domain.id;
    orm.name = domain.name;
    orm.slug = domain.slug;
    orm.description = domain.description;
    orm.iconUrl = domain.iconUrl;
    orm.isActive = domain.isActive;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    return orm;
  }

  /**
   * Converts an array of ORM entities to domain models.
   */
  static toDomainList(ormEntities: ORMDietTag[]): DietTag[] {
    return ormEntities.map((orm) => this.toDomain(orm));
  }
}

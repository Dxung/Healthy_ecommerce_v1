import { ORMAllergenTag } from '../entities/product';
import { AllergenTag } from 'src/modules/product/models/allergen-tag.model';

/**
 * Mapper for converting between ORM entity and domain model for AllergenTag.
 */
export class ORMAllergenTagMapper {
  /**
   * Converts an ORM entity to a domain model.
   */
  static toDomain(orm: ORMAllergenTag): AllergenTag {
    return new AllergenTag(
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
  static toOrm(domain: AllergenTag): ORMAllergenTag {
    const orm = new ORMAllergenTag();
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
  static toDomainList(ormEntities: ORMAllergenTag[]): AllergenTag[] {
    return ormEntities.map((orm) => this.toDomain(orm));
  }
}

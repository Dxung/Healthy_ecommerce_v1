import { ORMBrand } from '../entities/product';
import { Brand } from 'src/modules/product/models/brand.model';

/**
 * Mapper for converting between ORM entity and domain model for Brand.
 */
export class ORMBrandMapper {
  /**
   * Converts an ORM entity to a domain model.
   */
  static toDomain(orm: ORMBrand): Brand {
    return new Brand(
      orm.id,
      orm.name,
      orm.slug,
      orm.logoUrl,
      orm.description,
      orm.isActive,
      orm.createdAt,
      orm.updatedAt,
      orm.deletedAt,
    );
  }

  /**
   * Converts a domain model to an ORM entity.
   */
  static toOrm(domain: Brand): ORMBrand {
    const orm = new ORMBrand();
    orm.id = domain.id;
    orm.name = domain.name;
    orm.slug = domain.slug;
    orm.logoUrl = domain.logoUrl;
    orm.description = domain.description;
    orm.isActive = domain.isActive;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    orm.deletedAt = domain.deletedAt;
    return orm;
  }

  /**
   * Converts an array of ORM entities to domain models.
   */
  static toDomainList(ormEntities: ORMBrand[]): Brand[] {
    return ormEntities.map((orm) => this.toDomain(orm));
  }
}

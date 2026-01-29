import { ORMCategory } from '../entities/product';
import { Category } from 'src/modules/product/models/category.model';

/**
 * Mapper for converting between ORM entity and domain model for Category.
 */
export class ORMCategoryMapper {
  /**
   * Converts an ORM entity to a domain model.
   * Recursively maps children if they are loaded.
   */
  static toDomain(orm: ORMCategory): Category {
    const children = orm.children
      ? orm.children.map((child) => this.toDomain(child))
      : [];

    return new Category(
      orm.id,
      orm.parentId,
      orm.name,
      orm.slug,
      orm.iconUrl,
      orm.level,
      orm.isActive,
      orm.sortOrder,
      orm.createdAt,
      orm.updatedAt,
      orm.deletedAt,
      children,
    );
  }

  /**
   * Converts a domain model to an ORM entity.
   */
  static toOrm(domain: Category): ORMCategory {
    const orm = new ORMCategory();
    orm.id = domain.id;
    orm.parentId = domain.parentId;
    orm.name = domain.name;
    orm.slug = domain.slug;
    orm.iconUrl = domain.iconUrl;
    orm.level = domain.level;
    orm.isActive = domain.isActive;
    orm.sortOrder = domain.sortOrder;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    orm.deletedAt = domain.deletedAt;
    return orm;
  }

  /**
   * Converts an array of ORM entities to domain models.
   */
  static toDomainList(ormEntities: ORMCategory[]): Category[] {
    return ormEntities.map((orm) => this.toDomain(orm));
  }
}

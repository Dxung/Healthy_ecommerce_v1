import { ORMBrandDocumentRequirement } from '../entities/shop';
import { BrandDocumentRequirement } from 'src/modules/shop/models/brand-document-requirement.model';

/**
 * Mapper for converting between ORM entity and domain model for BrandDocumentRequirement.
 */
export class ORMBrandDocumentRequirementMapper {
  /**
   * Converts an ORM entity to a domain model.
   */
  static toDomain(orm: ORMBrandDocumentRequirement): BrandDocumentRequirement {
    return new BrandDocumentRequirement(
      orm.id,
      orm.brandId,
      orm.documentTypeId,
      orm.isActive,
      orm.createdAt,
      orm.updatedAt,
    );
  }

  /**
   * Converts a domain model to an ORM entity.
   */
  static toOrm(domain: BrandDocumentRequirement): ORMBrandDocumentRequirement {
    const orm = new ORMBrandDocumentRequirement();
    orm.id = domain.id;
    orm.brandId = domain.brandId;
    orm.documentTypeId = domain.documentTypeId;
    orm.isActive = domain.isActive;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    return orm;
  }

  /**
   * Converts an array of ORM entities to domain models.
   */
  static toDomainList(
    ormEntities: ORMBrandDocumentRequirement[],
  ): BrandDocumentRequirement[] {
    return ormEntities.map((orm) => this.toDomain(orm));
  }
}

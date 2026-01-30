import { ORMBadgeRequirement } from '../entities/shop';
import { BadgeRequirement } from 'src/modules/shop/models/badge-requirement.model';
import { ORMDocumentTypeMapper } from './document-type.mapper.orm';

/**
 * Mapper for converting between ORM entity and domain model for BadgeRequirement.
 */
export class ORMBadgeRequirementMapper {
  /**
   * Converts an ORM entity to a domain model.
   * If documentType relation is loaded, it will be mapped as well.
   */
  static toDomain(orm: ORMBadgeRequirement): BadgeRequirement {
    // Map document type if it was loaded with the requirement
    const documentType = orm.documentType
      ? ORMDocumentTypeMapper.toDomain(orm.documentType)
      : null;

    return new BadgeRequirement(
      orm.id,
      orm.badgeCode,
      orm.requirementType,
      orm.documentTypeId,
      orm.attributeCode,
      orm.operator,
      orm.attributeValue ? Number(orm.attributeValue) : null,
      orm.isActive,
      orm.createdAt,
      orm.updatedAt,
      documentType,
    );
  }

  /**
   * Converts a domain model to an ORM entity.
   */
  static toOrm(domain: BadgeRequirement): ORMBadgeRequirement {
    const orm = new ORMBadgeRequirement();
    orm.id = domain.id;
    orm.badgeCode = domain.badgeCode;
    orm.requirementType = domain.requirementType;
    orm.documentTypeId = domain.documentTypeId;
    orm.attributeCode = domain.attributeCode;
    orm.operator = domain.operator;
    orm.attributeValue = domain.attributeValue;
    orm.isActive = domain.isActive;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    return orm;
  }

  /**
   * Converts an array of ORM entities to domain models.
   */
  static toDomainList(ormEntities: ORMBadgeRequirement[]): BadgeRequirement[] {
    return ormEntities.map((orm) => this.toDomain(orm));
  }
}

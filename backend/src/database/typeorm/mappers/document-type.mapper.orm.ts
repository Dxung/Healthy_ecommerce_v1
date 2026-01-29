import { ORMDocumentType } from '../entities/shop';
import { DocumentType } from 'src/modules/shop/models/document-type.model';

/**
 * Mapper for converting between ORM entity and domain model for DocumentType.
 */
export class ORMDocumentTypeMapper {
  /**
   * Converts an ORM entity to a domain model.
   */
  static toDomain(orm: ORMDocumentType): DocumentType {
    return new DocumentType(
      orm.id,
      orm.name,
      orm.description,
      orm.sampleImageUrl,
      orm.isActive,
      orm.createdAt,
      orm.updatedAt,
    );
  }

  /**
   * Converts a domain model to an ORM entity.
   */
  static toOrm(domain: DocumentType): ORMDocumentType {
    const orm = new ORMDocumentType();
    orm.id = domain.id;
    orm.name = domain.name;
    orm.description = domain.description;
    orm.sampleImageUrl = domain.sampleImageUrl;
    orm.isActive = domain.isActive;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    return orm;
  }

  /**
   * Converts an array of ORM entities to domain models.
   */
  static toDomainList(ormEntities: ORMDocumentType[]): DocumentType[] {
    return ormEntities.map((orm) => this.toDomain(orm));
  }
}

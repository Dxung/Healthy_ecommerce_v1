import { ORMBadgeApplication } from '../entities/shop';
import { ORMBadgeApplicationDocument } from '../entities/shop';
import {
  BadgeApplication,
  BadgeApplicationDocument,
} from 'src/modules/shop/models/badge-application.model';

/**
 * Mapper for converting between ORM entity and domain model for BadgeApplication.
 */
export class ORMBadgeApplicationMapper {
  /**
   * Converts an ORM entity to a domain model.
   * Optionally populates shop name and brand name from relations.
   */
  static toDomain(orm: ORMBadgeApplication): BadgeApplication {
    const documents =
      orm.documents?.map((doc) => this.documentToDomain(doc)) ?? [];

    const application = new BadgeApplication(
      orm.id,
      orm.shopId,
      orm.applicationType,
      orm.brandId,
      orm.status,
      orm.rejectionReason,
      orm.reviewedBy,
      orm.reviewedAt,
      orm.createdAt,
      orm.updatedAt,
      documents,
    );

    // Populate shop name if relation is loaded
    if (orm.shop) {
      application.setShopName(orm.shop.name);
    }

    // Populate brand name if relation is loaded
    if (orm.brand) {
      application.setBrandName(orm.brand.name);
    }

    return application;
  }

  /**
   * Converts a domain model to an ORM entity.
   */
  static toOrm(domain: BadgeApplication): ORMBadgeApplication {
    const orm = new ORMBadgeApplication();
    orm.id = domain.id;
    orm.shopId = domain.shopId;
    orm.applicationType = domain.applicationType;
    orm.brandId = domain.brandId;
    orm.status = domain.status;
    orm.rejectionReason = domain.rejectionReason;
    orm.reviewedBy = domain.reviewedBy;
    orm.reviewedAt = domain.reviewedAt;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;

    // Map documents
    orm.documents = domain.documents.map((doc) => this.documentToOrm(doc));

    return orm;
  }

  /**
   * Converts document ORM to domain.
   * Includes document type name if relation is loaded.
   */
  static documentToDomain(
    orm: ORMBadgeApplicationDocument,
  ): BadgeApplicationDocument {
    return {
      id: orm.id,
      applicationId: orm.applicationId,
      documentTypeId: orm.documentTypeId,
      documentTypeName: orm.documentType?.name,
      imageUrl: orm.imageUrl,
      expiresAt: orm.expiresAt,
      createdAt: orm.createdAt,
    };
  }

  /**
   * Converts document domain to ORM.
   */
  static documentToOrm(
    domain: BadgeApplicationDocument,
  ): ORMBadgeApplicationDocument {
    const orm = new ORMBadgeApplicationDocument();
    orm.id = domain.id;
    orm.applicationId = domain.applicationId;
    orm.documentTypeId = domain.documentTypeId;
    orm.imageUrl = domain.imageUrl;
    orm.expiresAt = domain.expiresAt;
    orm.createdAt = domain.createdAt;
    return orm;
  }

  /**
   * Converts an array of ORM entities to domain models.
   */
  static toDomainList(ormEntities: ORMBadgeApplication[]): BadgeApplication[] {
    return ormEntities.map((orm) => this.toDomain(orm));
  }
}

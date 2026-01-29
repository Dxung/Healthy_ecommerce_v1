import {
  ORMShopRegistrationRequest,
  ORMShopRegistrationDocument,
  ORMShopRegistrationBrandDocument,
} from '../entities/shop';
import {
  ShopRegistrationRequest,
  ShopRegistrationDocument,
  ShopRegistrationBrandDocument,
} from 'src/modules/shop/models/shop-registration-request.model';

/**
 * Mapper to convert between ORM entities and Domain models for Shop Registration
 * This keeps the domain layer independent of the persistence layer
 */
export class ORMShopRegistrationRequestMapper {
  /**
   * Convert ORM entity to Domain model
   * @param ormEntity - TypeORM entity from database
   * @returns Domain model for business layer
   */
  static toDomain(ormEntity: ORMShopRegistrationRequest): ShopRegistrationRequest {
    const documents: ShopRegistrationDocument[] =
      ormEntity.documents?.map((doc) => ({
        id: doc.id,
        registrationId: doc.registrationId,
        documentTypeId: doc.documentTypeId,
        imageUrl: doc.imageUrl,
        expiresAt: doc.expiresAt,
        createdAt: doc.createdAt,
      })) ?? [];

    const brandDocuments: ShopRegistrationBrandDocument[] =
      ormEntity.brandDocuments?.map((doc) => ({
        id: doc.id,
        registrationId: doc.registrationId,
        documentTypeId: doc.documentTypeId,
        imageUrl: doc.imageUrl,
        expiresAt: doc.expiresAt,
        createdAt: doc.createdAt,
      })) ?? [];

    return new ShopRegistrationRequest(
      ormEntity.id,
      ormEntity.userId,
      ormEntity.name,
      ormEntity.slug,
      ormEntity.phone,
      ormEntity.email,
      ormEntity.addressLine,
      ormEntity.wardId,
      ormEntity.districtId,
      ormEntity.provinceId,
      ormEntity.logoUrl,
      ormEntity.coverUrl,
      ormEntity.requestedBrandId,
      ormEntity.status,
      ormEntity.rejectionReason,
      ormEntity.reviewedBy,
      ormEntity.reviewedAt,
      ormEntity.createdAt,
      ormEntity.updatedAt,
      documents,
      brandDocuments,
    );
  }

  /**
   * Convert Domain model to ORM entity (for updates/creates)
   * @param domainModel - Domain model from business layer
   * @returns TypeORM entity for database persistence
   */
  static toOrm(domainModel: ShopRegistrationRequest): ORMShopRegistrationRequest {
    const ormEntity = new ORMShopRegistrationRequest();
    ormEntity.id = domainModel.id;
    ormEntity.userId = domainModel.userId;
    ormEntity.name = domainModel.name;
    ormEntity.slug = domainModel.slug;
    ormEntity.phone = domainModel.phone;
    ormEntity.email = domainModel.email;
    ormEntity.addressLine = domainModel.addressLine;
    ormEntity.wardId = domainModel.wardId;
    ormEntity.districtId = domainModel.districtId;
    ormEntity.provinceId = domainModel.provinceId;
    ormEntity.logoUrl = domainModel.logoUrl;
    ormEntity.coverUrl = domainModel.coverUrl;
    ormEntity.requestedBrandId = domainModel.requestedBrandId;
    ormEntity.status = domainModel.status;
    ormEntity.rejectionReason = domainModel.rejectionReason;
    ormEntity.reviewedBy = domainModel.reviewedBy;
    ormEntity.reviewedAt = domainModel.reviewedAt;
    ormEntity.createdAt = domainModel.createdAt;
    ormEntity.updatedAt = domainModel.updatedAt;

    // Map documents
    ormEntity.documents = domainModel.documents.map((doc) => {
      const ormDoc = new ORMShopRegistrationDocument();
      ormDoc.id = doc.id;
      ormDoc.registrationId = doc.registrationId;
      ormDoc.documentTypeId = doc.documentTypeId;
      ormDoc.imageUrl = doc.imageUrl;
      ormDoc.expiresAt = doc.expiresAt;
      ormDoc.createdAt = doc.createdAt;
      return ormDoc;
    });

    // Map brand documents
    ormEntity.brandDocuments = domainModel.brandDocuments.map((doc) => {
      const ormDoc = new ORMShopRegistrationBrandDocument();
      ormDoc.id = doc.id;
      ormDoc.registrationId = doc.registrationId;
      ormDoc.documentTypeId = doc.documentTypeId;
      ormDoc.imageUrl = doc.imageUrl;
      ormDoc.expiresAt = doc.expiresAt;
      ormDoc.createdAt = doc.createdAt;
      return ormDoc;
    });

    return ormEntity;
  }

  /**
   * Convert array of ORM entities to array of Domain models
   * @param ormEntities - Array of TypeORM entities from database
   * @returns Array of Domain models for business layer
   */
  static toDomainList(ormEntities: ORMShopRegistrationRequest[]): ShopRegistrationRequest[] {
    return ormEntities.map((entity) => ORMShopRegistrationRequestMapper.toDomain(entity));
  }
}

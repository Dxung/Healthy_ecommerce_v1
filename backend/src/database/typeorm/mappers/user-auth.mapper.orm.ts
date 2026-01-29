import { ORMUserAuth } from '../entities/auth/orm.user-auth.entity';
import { UserAuth } from 'src/modules/auth/models/user-auth.model';

/**
 * Mapper to convert between UserAuth ORM entities and Domain models
 * This keeps the domain layer independent of the persistence layer
 */
export class ORMUserAuthMapper {
  /**
   * Convert ORM entity to Domain model
   * @param ormEntity - TypeORM entity from database
   * @returns Domain model for business layer
   */
  static toDomain(ormEntity: ORMUserAuth): UserAuth {
    return new UserAuth(
      ormEntity.id,
      ormEntity.userId,
      ormEntity.provider,
      ormEntity.providerId,
      ormEntity.passwordHash,
      ormEntity.createdAt,
      ormEntity.updatedAt,
    );
  }

  /**
   * Convert Domain model to ORM entity (for updates/creates)
   * @param domainModel - Domain model from business layer
   * @returns TypeORM entity for database persistence
   */
  static toOrm(domainModel: UserAuth): ORMUserAuth {
    const ormEntity = new ORMUserAuth();
    ormEntity.id = domainModel.id;
    ormEntity.userId = domainModel.userId;
    ormEntity.provider = domainModel.provider;
    ormEntity.providerId = domainModel.providerId;
    ormEntity.passwordHash = domainModel.passwordHash;
    ormEntity.createdAt = domainModel.createdAt;
    ormEntity.updatedAt = domainModel.updatedAt;
    return ormEntity;
  }

  /**
   * Convert array of ORM entities to array of Domain models
   * @param ormEntities - Array of TypeORM entities from database
   * @returns Array of Domain models for business layer
   */
  static toDomainList(ormEntities: ORMUserAuth[]): UserAuth[] {
    return ormEntities.map((entity) => ORMUserAuthMapper.toDomain(entity));
  }
}

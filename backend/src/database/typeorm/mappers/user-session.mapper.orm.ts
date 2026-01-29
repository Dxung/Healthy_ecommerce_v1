import { ORMUserSession } from '../entities/session/orm.user-session.entity';
import { UserSession } from 'src/modules/session/models/user-session.model';

/**
 * Mapper to convert between UserSession ORM entities and Domain models
 * This keeps the domain layer independent of the persistence layer
 */
export class ORMUserSessionMapper {
  /**
   * Convert ORM entity to Domain model
   * @param ormEntity - TypeORM entity from database
   * @returns Domain model for business layer
   */
  static toDomain(ormEntity: ORMUserSession): UserSession {
    return new UserSession(
      ormEntity.id,
      ormEntity.userId,
      ormEntity.sessionToken,
      ormEntity.deviceName,
      ormEntity.deviceType,
      ormEntity.browser,
      ormEntity.os,
      ormEntity.ipAddress,
      ormEntity.location,
      ormEntity.createdAt,
      ormEntity.lastActiveAt,
      ormEntity.expireAt,
    );
  }

  /**
   * Convert Domain model to ORM entity (for updates/creates)
   * @param domainModel - Domain model from business layer
   * @returns TypeORM entity for database persistence
   */
  static toOrm(domainModel: UserSession): ORMUserSession {
    const ormEntity = new ORMUserSession();
    ormEntity.id = domainModel.id;
    ormEntity.userId = domainModel.userId;
    ormEntity.sessionToken = domainModel.sessionToken;
    ormEntity.deviceName = domainModel.deviceName;
    ormEntity.deviceType = domainModel.deviceType;
    ormEntity.browser = domainModel.browser;
    ormEntity.os = domainModel.os;
    ormEntity.ipAddress = domainModel.ipAddress;
    ormEntity.location = domainModel.location;
    ormEntity.createdAt = domainModel.createdAt;
    ormEntity.lastActiveAt = domainModel.lastActiveAt;
    ormEntity.expireAt = domainModel.expireAt;
    return ormEntity;
  }

  /**
   * Convert array of ORM entities to array of Domain models
   * @param ormEntities - Array of TypeORM entities from database
   * @returns Array of Domain models for business layer
   */
  static toDomainList(ormEntities: ORMUserSession[]): UserSession[] {
    return ormEntities.map((entity) => ORMUserSessionMapper.toDomain(entity));
  }
}

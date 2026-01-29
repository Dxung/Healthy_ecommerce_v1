import { ORMUserCore } from '../entities/user/orm.user-core.entity';
import { User } from 'src/modules/user/models/user.model';

/**
 * Mapper to convert between ORM entities and Domain models
 * This keeps the domain layer independent of the persistence layer
 */
export class ORMUserMapper {
  /**
   * Convert ORM entity to Domain model
   * @param ormEntity - TypeORM entity from database
   * @returns Domain model for business layer
   */
  static toDomain(ormEntity: ORMUserCore): User {
    return new User(
      ormEntity.id,
      ormEntity.createdAt,
      ormEntity.username,
      ormEntity.dateOfBirth,
      ormEntity.gender,
      ormEntity.fullName,
      ormEntity.email,
      ormEntity.phoneNumber,
      ormEntity.avatarUrl,
      ormEntity.status,
      ormEntity.dateOfBirthChangedAt,
      ormEntity.genderChangedAt,
      ormEntity.deletedAt,
      ormEntity.updatedAt,
    );
  }

  /**
   * Convert Domain model to ORM entity (for updates/creates)
   * @param domainModel - Domain model from business layer
   * @returns TypeORM entity for database persistence
   */
  static toOrm(domainModel: User): ORMUserCore {
    const ormEntity = new ORMUserCore();
    ormEntity.id = domainModel.id;
    ormEntity.createdAt = domainModel.createdAt;
    ormEntity.username = domainModel.username;
    ormEntity.dateOfBirth = domainModel.dateOfBirth;
    ormEntity.gender = domainModel.gender;
    ormEntity.fullName = domainModel.fullName;
    ormEntity.email = domainModel.email;
    ormEntity.phoneNumber = domainModel.phoneNumber;
    ormEntity.avatarUrl = domainModel.avatarUrl;
    ormEntity.status = domainModel.status;
    ormEntity.dateOfBirthChangedAt = domainModel.dateOfBirthChangedAt;
    ormEntity.genderChangedAt = domainModel.genderChangedAt;
    ormEntity.deletedAt = domainModel.deletedAt;
    ormEntity.updatedAt = domainModel.updatedAt;
    return ormEntity;
  }

  /**
   * Convert array of ORM entities to array of Domain models, used when fetching multiple users
   * @param ormEntities - Array of TypeORM entities from database
   * @returns Array of Domain models for business layer
   */
  static toDomainList(ormEntities: ORMUserCore[]): User[] {
    return ormEntities.map((entity) => ORMUserMapper.toDomain(entity));
  }
}

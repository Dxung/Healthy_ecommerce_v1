import { ORMSystemConfig } from '../entities/config';
import { SystemConfig } from 'src/modules/system-config/models/system-config.model';

/**
 * Mapper for converting between ORM and Domain models for SystemConfig
 */
export class SystemConfigOrmMapper {
  /**
   * Convert ORM entity to Domain model
   */
  static toDomain(orm: ORMSystemConfig): SystemConfig {
    return SystemConfig.fromPersistence({
      id: orm.id,
      key: orm.configKey,
      value: orm.configValue,
      description: orm.description,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  /**
   * Convert Domain model to ORM entity
   */
  static toOrm(domain: SystemConfig): ORMSystemConfig {
    const orm = new ORMSystemConfig();
    orm.id = domain.id;
    orm.configKey = domain.key;
    orm.configValue = domain.value;
    orm.description = domain.description;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    return orm;
  }

  /**
   * Convert multiple ORM entities to Domain models
   */
  static toDomainList(orms: ORMSystemConfig[]): SystemConfig[] {
    return orms.map((orm) => this.toDomain(orm));
  }
}

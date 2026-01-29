import { ORMPermission } from '../entities/authorization/orm.permission.entity';
import { Permission } from 'src/modules/authorization/models';

export class PermissionOrmMapper {
  static toDomain(orm: ORMPermission): Permission {
    return Permission.fromPersistence({
      id: orm.id,
      permissionName: orm.permissionName,
      resource: orm.resource,
      action: orm.action,
      description: orm.description,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  static toDomainList(orms: ORMPermission[]): Permission[] {
    return orms.map((orm) => PermissionOrmMapper.toDomain(orm));
  }

  static toOrm(permission: Permission): ORMPermission {
    const orm = new ORMPermission();
    orm.id = permission.id;
    orm.permissionName = permission.permissionName;
    orm.resource = permission.resource;
    orm.action = permission.action;
    orm.description = permission.description;
    orm.createdAt = permission.createdAt;
    orm.updatedAt = permission.updatedAt;
    return orm;
  }
}

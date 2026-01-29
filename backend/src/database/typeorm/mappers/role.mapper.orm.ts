import { ORMRole } from '../entities/authorization/orm.role.entity';
import { Role } from 'src/modules/authorization/models';
import { PermissionOrmMapper } from './permission.mapper.orm';

export class RoleOrmMapper {
  static toDomain(orm: ORMRole): Role {
    const permissions =
      orm.roleHasPermissions?.map((rhp) =>
        PermissionOrmMapper.toDomain(rhp.permission),
      ) ?? [];

    return Role.fromPersistence({
      id: orm.id,
      roleName: orm.roleName,
      description: orm.description,
      isActive: orm.isActive,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
      permissions,
    });
  }

  static toDomainList(orms: ORMRole[]): Role[] {
    return orms.map((orm) => RoleOrmMapper.toDomain(orm));
  }

  static toOrm(role: Role): ORMRole {
    const orm = new ORMRole();
    orm.id = role.id;
    orm.roleName = role.roleName;
    orm.description = role.description;
    orm.isActive = role.isActive;
    orm.createdAt = role.createdAt;
    orm.updatedAt = role.updatedAt;
    return orm;
  }
}

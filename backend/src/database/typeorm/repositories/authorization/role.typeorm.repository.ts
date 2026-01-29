import { Injectable } from '@nestjs/common';
import { DataSource, Not } from 'typeorm';
import { ResultAsync } from 'neverthrow';
import { AsyncLocalStorage } from 'async_hooks';
import { IRoleRepository } from 'src/modules/authorization/repository/role.repository.interface';
import { Role } from 'src/modules/authorization/models';
import { ORMRole } from '../../entities/authorization/orm.role.entity';
import { ORMUsersHaveRoles } from '../../entities/authorization/orm.users-have-roles.entity';
import { ORMRolesHavePermissions } from '../../entities/authorization/orm.roles-have-permissions.entity';
import { RoleOrmMapper } from '../../mappers/role.mapper.orm';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { SHARED_ERRORS } from 'src/shared/errors/shared.errors';
import { ITypeORMAlsStore } from 'src/shared/als/interfaces/als-store.interface';
import { isQueryFailedPostgresError } from '../../guards/type-guard.database';
import { PG_UNIQUE_VIOLATION } from 'src/database/constant/postgresql-error.constant';
import { AUTHORIZATION_ERRORS } from 'src/modules/authorization/errors/authorization.errors';
import { sanitizePostgresError } from '../../guards/sanitize-postgres-error.util';

@Injectable()
export class OrmRoleRepository implements IRoleRepository {
  constructor(
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
    private readonly dataSource: DataSource,
  ) {}

  @WithPosition()
  findAll(filter?: { isActive?: boolean }): ResultAsync<Role[], DomainError> {
    const repo = this.getRoleRepository();
    const where: Record<string, unknown> = {};

    if (filter?.isActive !== undefined) {
      where.isActive = filter.isActive;
    }

    return ResultAsync.fromPromise(
      repo.find({
        where,
        order: { roleName: 'ASC' },
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orms) => RoleOrmMapper.toDomainList(orms));
  }

  @WithPosition()
  findById(id: string): ResultAsync<Role | null, DomainError> {
    const repo = this.getRoleRepository();

    return ResultAsync.fromPromise(repo.findOne({ where: { id } }), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orm) => (orm ? RoleOrmMapper.toDomain(orm) : null));
  }

  @WithPosition()
  findByIdWithPermissions(id: string): ResultAsync<Role | null, DomainError> {
    const repo = this.getRoleRepository();

    return ResultAsync.fromPromise(
      repo.findOne({
        where: { id },
        relations: ['roleHasPermissions', 'roleHasPermissions.permission'],
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orm) => (orm ? RoleOrmMapper.toDomain(orm) : null));
  }

  @WithPosition()
  findByName(roleName: string): ResultAsync<Role | null, DomainError> {
    const repo = this.getRoleRepository();

    return ResultAsync.fromPromise(
      repo.findOne({ where: { roleName } }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orm) => (orm ? RoleOrmMapper.toDomain(orm) : null));
  }

  @WithPosition()
  create(role: Role): ResultAsync<Role, DomainError> {
    const repo = this.getRoleRepository();
    const orm = RoleOrmMapper.toOrm(role);

    return ResultAsync.fromPromise(repo.save(orm), (error) => {
      if (isQueryFailedPostgresError(error)) {
        const safeError = sanitizePostgresError(error.driverError);
        if (error.driverError.code === PG_UNIQUE_VIOLATION) {
          return createDomainError(AUTHORIZATION_ERRORS.ROLE_NAME_EXISTS, {
            cause: safeError,
          });
        }
      }
      return createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error });
    }).map((saved) => RoleOrmMapper.toDomain(saved));
  }

  @WithPosition()
  update(role: Role): ResultAsync<Role, DomainError> {
    const repo = this.getRoleRepository();
    const orm = RoleOrmMapper.toOrm(role);

    return ResultAsync.fromPromise(repo.save(orm), (error) => {
      if (isQueryFailedPostgresError(error)) {
        const safeError = sanitizePostgresError(error.driverError);
        if (error.driverError.code === PG_UNIQUE_VIOLATION) {
          return createDomainError(AUTHORIZATION_ERRORS.ROLE_NAME_EXISTS, {
            cause: safeError,
          });
        }
      }
      return createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error });
    }).map((saved) => RoleOrmMapper.toDomain(saved));
  }

  @WithPosition()
  delete(id: string): ResultAsync<void, DomainError> {
    const repo = this.getRoleRepository();

    return ResultAsync.fromPromise(repo.delete({ id }), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map(() => undefined);
  }

  @WithPosition()
  hasUsers(roleId: string): ResultAsync<boolean, DomainError> {
    const repo = this.getUsersHaveRolesRepository();

    return ResultAsync.fromPromise(
      repo.exists({
        where: { roleId },
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    );
  }

  @WithPosition()
  roleNameExists(
    roleName: string,
    excludeId?: string,
  ): ResultAsync<boolean, DomainError> {
    const repo = this.getRoleRepository();
    const where: Record<string, unknown> = { roleName };

    if (excludeId) {
      where.id = Not(excludeId);
    }

    return ResultAsync.fromPromise(repo.exists({ where }), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    );
  }

  @WithPosition()
  assignPermissions(
    roleId: string,
    permissionIds: string[],
    grantedBy: string,
    note?: string,
  ): ResultAsync<void, DomainError> {
    const repo = this.getRolesHavePermissionsRepository();

    const assignments = permissionIds.map((permissionId) =>
      repo.create({
        roleId,
        permissionId,
        grantedBy,
        note: note ?? null,
      }),
    );

    return ResultAsync.fromPromise(
      repo.upsert(assignments, {
        conflictPaths: ['roleId', 'permissionId'],
        skipUpdateIfNoValuesChanged: true,
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map(() => undefined);
  }

  @WithPosition()
  removePermission(
    roleId: string,
    permissionId: string,
  ): ResultAsync<void, DomainError> {
    const repo = this.getRolesHavePermissionsRepository();

    return ResultAsync.fromPromise(
      repo.delete({ roleId, permissionId }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map(() => undefined);
  }

  @WithPosition()
  getPermissionIds(roleId: string): ResultAsync<string[], DomainError> {
    const repo = this.getRolesHavePermissionsRepository();

    return ResultAsync.fromPromise(
      repo.find({
        where: { roleId },
        select: ['permissionId'],
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((results) => results.map((r) => r.permissionId));
  }

  @WithPosition()
  getUserIdsWithRole(roleId: string): ResultAsync<string[], DomainError> {
    const repo = this.getUsersHaveRolesRepository();

    return ResultAsync.fromPromise(
      repo.find({
        where: { roleId },
        select: ['userId'],
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((results) => results.map((r) => r.userId));
  }

  @WithPosition()
  getUserRolesWithDetails(userId: string): ResultAsync<
    Array<{
      role: Role;
      assignedAt: Date;
      expireAt: Date | null;
      assignedBy: string | null;
    }>,
    DomainError
  > {
    const repo = this.getUsersHaveRolesRepository();

    return ResultAsync.fromPromise(
      repo.find({
        where: { userId },
        relations: ['role'],
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((results) =>
      results.map((r) => ({
        role: RoleOrmMapper.toDomain(r.role),
        assignedAt: r.assignedAt,
        expireAt: r.expireAt,
        assignedBy: r.assignedBy,
      })),
    );
  }

  @WithPosition()
  assignRoleToUser(
    userId: string,
    roleId: string,
    assignedBy: string,
    expireAt?: Date,
  ): ResultAsync<void, DomainError> {
    const repo = this.getUsersHaveRolesRepository();

    const assignment = repo.create({
      userId,
      roleId,
      assignedBy,
      expireAt: expireAt ?? null,
    });

    return ResultAsync.fromPromise(repo.save(assignment), (error) => {
      if (isQueryFailedPostgresError(error)) {
        const safeError = sanitizePostgresError(error.driverError);
        if (error.driverError.code === PG_UNIQUE_VIOLATION) {
          return createDomainError(AUTHORIZATION_ERRORS.USER_ALREADY_HAS_ROLE, {
            cause: safeError,
          });
        }
      }
      return createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error });
    }).map(() => undefined);
  }

  @WithPosition()
  removeRoleFromUser(
    userId: string,
    roleId: string,
  ): ResultAsync<void, DomainError> {
    const repo = this.getUsersHaveRolesRepository();

    return ResultAsync.fromPromise(repo.delete({ userId, roleId }), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map(() => undefined);
  }

  @WithPosition()
  userHasRole(
    userId: string,
    roleId: string,
  ): ResultAsync<boolean, DomainError> {
    const repo = this.getUsersHaveRolesRepository();

    return ResultAsync.fromPromise(
      repo.exists({ where: { userId, roleId } }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    );
  }

  private getEntityManager() {
    const store = this.als.getStore();
    if (!store || !store.ctx) return null;
    return store.ctx;
  }

  private getRoleRepository() {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return em.getRepository(ORMRole);
  }

  private getUsersHaveRolesRepository() {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return em.getRepository(ORMUsersHaveRoles);
  }

  private getRolesHavePermissionsRepository() {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return em.getRepository(ORMRolesHavePermissions);
  }
}

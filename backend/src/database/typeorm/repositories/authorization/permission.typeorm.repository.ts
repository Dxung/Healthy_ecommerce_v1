import { Injectable } from '@nestjs/common';
import { DataSource, In, Not } from 'typeorm';
import { ResultAsync } from 'neverthrow';
import { AsyncLocalStorage } from 'async_hooks';
import { IPermissionRepository } from 'src/modules/authorization/repository/permission.repository.interface';
import { Permission } from 'src/modules/authorization/models';
import { ORMPermission } from '../../entities/authorization/orm.permission.entity';
import { ORMRolesHavePermissions } from '../../entities/authorization/orm.roles-have-permissions.entity';
import { PermissionOrmMapper } from '../../mappers/permission.mapper.orm';
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
export class OrmPermissionRepository implements IPermissionRepository {
  constructor(
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
    private readonly dataSource: DataSource,
  ) {}

  @WithPosition()
  findAll(): ResultAsync<Permission[], DomainError> {
    const repo = this.getPermissionRepository();

    return ResultAsync.fromPromise(
      repo.find({
        order: { resource: 'ASC', action: 'ASC' },
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orms) => PermissionOrmMapper.toDomainList(orms));
  }

  @WithPosition()
  findById(id: string): ResultAsync<Permission | null, DomainError> {
    const repo = this.getPermissionRepository();

    return ResultAsync.fromPromise(repo.findOne({ where: { id } }), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orm) => (orm ? PermissionOrmMapper.toDomain(orm) : null));
  }

  @WithPosition()
  findByIds(ids: string[]): ResultAsync<Permission[], DomainError> {
    if (ids.length === 0) {
      return ResultAsync.fromSafePromise(Promise.resolve([]));
    }

    const repo = this.getPermissionRepository();

    return ResultAsync.fromPromise(
      repo.find({ where: { id: In(ids) } }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orms) => PermissionOrmMapper.toDomainList(orms));
  }

  @WithPosition()
  findByName(
    permissionName: string,
  ): ResultAsync<Permission | null, DomainError> {
    const repo = this.getPermissionRepository();

    return ResultAsync.fromPromise(
      repo.findOne({ where: { permissionName } }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orm) => (orm ? PermissionOrmMapper.toDomain(orm) : null));
  }

  @WithPosition()
  create(permission: Permission): ResultAsync<Permission, DomainError> {
    const repo = this.getPermissionRepository();
    const orm = PermissionOrmMapper.toOrm(permission);

    return ResultAsync.fromPromise(repo.save(orm), (error) => {
      if (isQueryFailedPostgresError(error)) {
        const safeError = sanitizePostgresError(error.driverError);
        if (error.driverError.code === PG_UNIQUE_VIOLATION) {
          return createDomainError(
            AUTHORIZATION_ERRORS.PERMISSION_NAME_EXISTS,
            {
              cause: safeError,
            },
          );
        }
      }
      return createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error });
    }).map((saved) => PermissionOrmMapper.toDomain(saved));
  }

  @WithPosition()
  update(permission: Permission): ResultAsync<Permission, DomainError> {
    const repo = this.getPermissionRepository();
    const orm = PermissionOrmMapper.toOrm(permission);

    return ResultAsync.fromPromise(repo.save(orm), (error) => {
      if (isQueryFailedPostgresError(error)) {
        const safeError = sanitizePostgresError(error.driverError);
        if (error.driverError.code === PG_UNIQUE_VIOLATION) {
          return createDomainError(
            AUTHORIZATION_ERRORS.PERMISSION_NAME_EXISTS,
            {
              cause: safeError,
            },
          );
        }
      }
      return createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error });
    }).map((saved) => PermissionOrmMapper.toDomain(saved));
  }

  @WithPosition()
  delete(id: string): ResultAsync<void, DomainError> {
    const repo = this.getPermissionRepository();

    return ResultAsync.fromPromise(repo.delete({ id }), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map(() => undefined);
  }

  @WithPosition()
  hasRoles(permissionId: string): ResultAsync<boolean, DomainError> {
    const repo = this.getRolesHavePermissionsRepository();

    return ResultAsync.fromPromise(
      repo.exists({ where: { permissionId } }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    );
  }

  @WithPosition()
  permissionNameExists(
    permissionName: string,
    excludeId?: string,
  ): ResultAsync<boolean, DomainError> {
    const repo = this.getPermissionRepository();
    const where: Record<string, unknown> = { permissionName };

    if (excludeId) {
      where.id = Not(excludeId);
    }

    return ResultAsync.fromPromise(repo.exists({ where }), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    );
  }

  @WithPosition()
  resourceActionExists(
    resource: string,
    action: string,
    excludeId?: string,
  ): ResultAsync<boolean, DomainError> {
    const repo = this.getPermissionRepository();
    const where: Record<string, unknown> = { resource, action };

    if (excludeId) {
      where.id = Not(excludeId);
    }

    return ResultAsync.fromPromise(repo.exists({ where }), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    );
  }

  private getEntityManager() {
    const store = this.als.getStore();
    if (!store || !store.ctx) return null;
    return store.ctx;
  }

  private getPermissionRepository() {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return em.getRepository(ORMPermission);
  }

  private getRolesHavePermissionsRepository() {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return em.getRepository(ORMRolesHavePermissions);
  }
}

import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ResultAsync, errAsync } from 'neverthrow';
import { AsyncLocalStorage } from 'async_hooks';
import { IAuthorizationRepository } from 'src/modules/authorization/repository/authorization.repository.interface';
import { ORMUsersHaveRoles } from '../../entities/authorization/orm.users-have-roles.entity';
import { ORMRole } from '../../entities/authorization/orm.role.entity';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { SHARED_ERRORS } from 'src/shared/errors/shared.errors';
import { AUTHORIZATION_ERRORS } from 'src/modules/authorization/errors/authorization.errors';
import { ITypeORMAlsStore } from 'src/shared/als/interfaces/als-store.interface';
import { isQueryFailedPostgresError } from '../../guards/type-guard.database';
import { PG_UNIQUE_VIOLATION } from 'src/database/constant/postgresql-error.constant';

@Injectable()
export class OrmAuthorizationRepository implements IAuthorizationRepository {
  constructor(
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
    private readonly dataSource: DataSource,
  ) {}

  @WithPosition()
  getUserPermissions(userId: string): ResultAsync<string[], DomainError> {
    const queryBuilder = this.getUsersHaveRolesRepository()
      .createQueryBuilder('uhr')
      .select("DISTINCT CONCAT(p.resource, ':', p.action)", 'permission')
      .innerJoin('uhr.role', 'r')
      .innerJoin('r.roleHasPermissions', 'rhp')
      .innerJoin('rhp.permission', 'p')
      .where('uhr.userId = :userId', { userId })
      .andWhere('r.isActive = :isActive', { isActive: true })
      .andWhere('(uhr.expireAt IS NULL OR uhr.expireAt > :now)', {
        now: new Date(),
      });

    return ResultAsync.fromPromise(
      queryBuilder.getRawMany<{ permission: string }>(),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((results) => results.map((row) => row.permission));
  }

  @WithPosition()
  hasAnyRole(
    userId: string,
    roleNames: string[],
  ): ResultAsync<boolean, DomainError> {
    const queryBuilder = this.getUsersHaveRolesRepository()
      .createQueryBuilder('uhr')
      .innerJoin('uhr.role', 'r')
      .where('uhr.userId = :userId', { userId })
      .andWhere('r.roleName IN (:...roleNames)', { roleNames })
      .andWhere('r.isActive = :isActive', { isActive: true })
      .andWhere('(uhr.expireAt IS NULL OR uhr.expireAt > :now)', {
        now: new Date(),
      });

    return ResultAsync.fromPromise(queryBuilder.getExists(), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    );
  }

  @WithPosition()
  getUserRoles(userId: string): ResultAsync<string[], DomainError> {
    const queryBuilder = this.getUsersHaveRolesRepository()
      .createQueryBuilder('uhr')
      .select('DISTINCT r.role_name', 'roleName')
      .innerJoin('uhr.role', 'r')
      .where('uhr.userId = :userId', { userId })
      .andWhere('r.isActive = :isActive', { isActive: true })
      .andWhere('(uhr.expireAt IS NULL OR uhr.expireAt > :now)', {
        now: new Date(),
      });

    return ResultAsync.fromPromise(
      queryBuilder.getRawMany<{ roleName: string }>(),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((results) => results.map((row) => row.roleName));
  }

  @WithPosition()
  assignRoleToUser(
    userId: string,
    roleName: string,
    assignedBy: string | null,
    expireAt?: Date | null,
  ): ResultAsync<void, DomainError> {
    const roleRepo = this.getRoleRepository();
    const usersHaveRolesRepo = this.getUsersHaveRolesRepository();

    // Step 1: Find the role by name
    return ResultAsync.fromPromise(
      roleRepo.findOne({
        where: { roleName, isActive: true },
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).andThen((role) => {
      if (!role) {
        return errAsync(createDomainError(AUTHORIZATION_ERRORS.ROLE_NOT_FOUND));
      }

      // Step 2: Create the users_have_roles record
      const assignment = usersHaveRolesRepo.create({
        userId,
        roleId: role.id,
        assignedBy,
        expireAt: expireAt ?? null,
      });

      // Step 3: Save the assignment
      return ResultAsync.fromPromise(
        usersHaveRolesRepo.save(assignment),
        (error) => {
          // Handle unique constraint violation (user already has this role)
          if (isQueryFailedPostgresError(error)) {
            if (error.driverError.code === PG_UNIQUE_VIOLATION) {
              return createDomainError(
                AUTHORIZATION_ERRORS.USER_ALREADY_HAS_ROLE,
              );
            }
          }
          return createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error });
        },
      ).map(() => undefined);
    });
  }

  private getEntityManager() {
    const store = this.als.getStore();
    if (!store || !store.ctx) return null;
    return store.ctx;
  }

  private getUsersHaveRolesRepository() {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return em.getRepository(ORMUsersHaveRoles);
  }

  private getRoleRepository() {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return em.getRepository(ORMRole);
  }
}

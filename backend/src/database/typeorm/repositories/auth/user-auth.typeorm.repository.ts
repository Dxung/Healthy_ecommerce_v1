import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { IUserAuthRepository } from 'src/modules/auth/repository/user-auth.repository.interface';
import { ITypeORMAlsStore } from 'src/shared/als/interfaces/als-store.interface';
import { DataSource } from 'typeorm';
import { ORMUserAuth } from '../../entities';
import { UserAuth } from 'src/modules/auth/models/user-auth.model';
import { ResultAsync } from 'neverthrow';
import {
  createDomainError,
  DomainError,
} from 'src/shared/types/domain-error.type';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import { ORMUserAuthMapper } from '../../mappers/user-auth.mapper.orm';
import { SHARED_ERRORS } from 'src/shared/errors/shared.errors';
import { UserAuthProviderEnum } from 'src/modules/auth/enums/user_auth.enum';

@Injectable()
export class OrmUserAuthRepository implements IUserAuthRepository {
  constructor(
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Creates a new authentication record for a user.
   * @param userAuth - The UserAuth domain model containing auth details.
   * @returns ResultAsync containing the created UserAuth on success or DomainError on failure.
   */
  @WithPosition()
  createNewAuthForUser(userAuth: UserAuth): ResultAsync<UserAuth, DomainError> {
    const repo = this.getUserAuthRepository();
    const ormEntity = ORMUserAuthMapper.toOrm(userAuth);
    return ResultAsync.fromPromise(repo.save(ormEntity), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((createdOrmEntity) => ORMUserAuthMapper.toDomain(createdOrmEntity));
  }

  /**
   * Gets the hashed password for a user with LOCAL provider.
   * @param userId - The ID of the user.
   * @returns ResultAsync containing the hashed password string if found, null if not found, or DomainError on failure.
   */
  @WithPosition()
  getHashedPassword(userId: string): ResultAsync<string | null, DomainError> {
    const repo = this.getUserAuthRepository();
    return ResultAsync.fromPromise(
      repo.findOne({
        where: {
          userId,
          provider: UserAuthProviderEnum.LOCAL,
        },
        select: ['passwordHash'],
      }),
      (error) => {
        return createDomainError(SHARED_ERRORS.DB_ERROR, {
          cause: error,
        });
      },
    ).map((ormUserAuth) => {
      if (!ormUserAuth || !ormUserAuth.passwordHash) {
        return null;
      }
      return ormUserAuth.passwordHash;
    });
  }

  /**
   * Changes the password for a user with LOCAL provider.
   * @param userId - The ID of the user.
   * @param newHashedPassword - The new hashed password.
   * @returns ResultAsync containing void on success or DomainError on failure.
   */
  @WithPosition()
  changePassword(
    userId: string,
    newHashedPassword: string,
  ): ResultAsync<void, DomainError> {
    const repo = this.getUserAuthRepository();
    return ResultAsync.fromPromise(
      repo.update(
        {
          userId,
          provider: UserAuthProviderEnum.LOCAL,
        },
        {
          passwordHash: newHashedPassword,
        },
      ),
      (error) => {
        return createDomainError(SHARED_ERRORS.DB_ERROR, {
          cause: error,
        });
      },
    ).map(() => undefined);
  }

  /**
   * Gets the password updated timestamp for a user with LOCAL provider.
   * @param userId - The ID of the user.
   * @returns ResultAsync containing the Date when password was last updated if found, null if not found, or DomainError on failure.
   */
  @WithPosition()
  getPasswordUpdatedAt(userId: string): ResultAsync<Date | null, DomainError> {
    const repo = this.getUserAuthRepository();
    return ResultAsync.fromPromise(
      repo.findOne({
        where: {
          userId,
          provider: UserAuthProviderEnum.LOCAL,
        },
        select: ['updatedAt'],
      }),
      (error) => {
        return createDomainError(SHARED_ERRORS.DB_ERROR, {
          cause: error,
        });
      },
    ).map((ormUserAuth) => {
      if (!ormUserAuth) {
        return null;
      }
      return ormUserAuth.updatedAt;
    });
  }

  /**
   * Gets the current EntityManager from AsyncLocalStorage, if available.
   * @returns The EntityManager or null if not found
   */
  private getEntityManager() {
    if (!this.als) return null;
    const store = this.als.getStore();
    if (!store || !store.ctx) return null;
    return store.ctx;
  }

  private getUserAuthRepository() {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return em.getRepository(ORMUserAuth);
  }
}

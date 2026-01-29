import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { DataSource } from 'typeorm';
import { ResultAsync } from 'neverthrow';
import { ITypeORMAlsStore } from 'src/shared/als/interfaces/als-store.interface';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { SHARED_ERRORS } from 'src/shared/errors/shared.errors';
import { IHealthProfileRepository } from 'src/modules/meal-plan/repository/health-profile.repository.interface';
import { UserHealthProfile } from 'src/modules/meal-plan/models/user-health-profile.model';
import { ORMUserHealthProfile } from '../../entities/meal-plan';
import { ORMUserHealthProfileMapper } from '../../mappers/user-health-profile.mapper.orm';

@Injectable()
export class OrmHealthProfileRepository implements IHealthProfileRepository {
  constructor(
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
    private readonly dataSource: DataSource,
  ) {}

  @WithPosition()
  findByUserId(userId: string): ResultAsync<UserHealthProfile | null, DomainError> {
    const repo = this.getRepository();
    return ResultAsync.fromPromise(
      repo.findOne({ where: { userId } }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orm) => (orm ? ORMUserHealthProfileMapper.toDomain(orm) : null));
  }

  @WithPosition()
  findById(id: string): ResultAsync<UserHealthProfile | null, DomainError> {
    const repo = this.getRepository();
    return ResultAsync.fromPromise(
      repo.findOne({ where: { id } }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orm) => (orm ? ORMUserHealthProfileMapper.toDomain(orm) : null));
  }

  @WithPosition()
  create(profile: UserHealthProfile): ResultAsync<UserHealthProfile, DomainError> {
    const repo = this.getRepository();
    const orm = ORMUserHealthProfileMapper.toOrm(profile);
    return ResultAsync.fromPromise(repo.save(orm), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((saved) => ORMUserHealthProfileMapper.toDomain(saved));
  }

  @WithPosition()
  update(profile: UserHealthProfile): ResultAsync<UserHealthProfile, DomainError> {
    const repo = this.getRepository();
    const orm = ORMUserHealthProfileMapper.toOrm(profile);
    return ResultAsync.fromPromise(repo.save(orm), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((saved) => ORMUserHealthProfileMapper.toDomain(saved));
  }

  @WithPosition()
  upsert(profile: UserHealthProfile): ResultAsync<UserHealthProfile, DomainError> {
    const repo = this.getRepository();
    const orm = ORMUserHealthProfileMapper.toOrm(profile);
    return ResultAsync.fromPromise(
      repo.upsert(orm, ['userId']),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).andThen(() => this.findByUserId(profile.userId))
      .map((result) => result!);
  }

  private getEntityManager() {
    if (!this.als) return null;
    const store = this.als.getStore();
    if (!store || !store.ctx) return null;
    return store.ctx;
  }

  private getRepository() {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return em.getRepository(ORMUserHealthProfile);
  }
}

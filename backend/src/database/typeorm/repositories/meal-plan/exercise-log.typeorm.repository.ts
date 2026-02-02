import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { DataSource, Between } from 'typeorm';
import { ResultAsync } from 'neverthrow';
import { ITypeORMAlsStore } from 'src/shared/als/interfaces/als-store.interface';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { SHARED_ERRORS } from 'src/shared/errors/shared.errors';
import { IExerciseLogRepository } from 'src/modules/meal-plan/repository/exercise-log.repository.interface';
import { ExerciseLog } from 'src/modules/meal-plan/models/exercise-log.model';
import { ORMExerciseLog } from '../../entities/meal-plan';
import { ORMExerciseLogMapper } from '../../mappers/exercise-log.mapper.orm';

@Injectable()
export class OrmExerciseLogRepository implements IExerciseLogRepository {
  constructor(
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
    private readonly dataSource: DataSource,
  ) {}

  @WithPosition()
  findById(id: string): ResultAsync<ExerciseLog | null, DomainError> {
    const repo = this.getRepository();
    return ResultAsync.fromPromise(repo.findOne({ where: { id } }), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orm) => (orm ? ORMExerciseLogMapper.toDomain(orm) : null));
  }

  @WithPosition()
  findByUserAndDate(
    userId: string,
    date: Date,
  ): ResultAsync<ExerciseLog[], DomainError> {
    const repo = this.getRepository();
    const dateStr = this.formatDate(date);

    return ResultAsync.fromPromise(
      repo.find({
        where: {
          userId,
          logDate: dateStr as any,
        },
        order: { createdAt: 'ASC' },
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orms) => ORMExerciseLogMapper.toDomainList(orms));
  }

  @WithPosition()
  findByUserAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): ResultAsync<ExerciseLog[], DomainError> {
    const repo = this.getRepository();

    return ResultAsync.fromPromise(
      repo.find({
        where: {
          userId,
          logDate: Between(
            this.formatDate(startDate),
            this.formatDate(endDate),
          ) as any,
        },
        order: { logDate: 'ASC', createdAt: 'ASC' },
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orms) => ORMExerciseLogMapper.toDomainList(orms));
  }

  @WithPosition()
  create(log: ExerciseLog): ResultAsync<ExerciseLog, DomainError> {
    const repo = this.getRepository();
    const orm = ORMExerciseLogMapper.toOrm(log);
    return ResultAsync.fromPromise(repo.save(orm), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((saved) => ORMExerciseLogMapper.toDomain(saved));
  }

  @WithPosition()
  update(log: ExerciseLog): ResultAsync<ExerciseLog, DomainError> {
    const repo = this.getRepository();
    const orm = ORMExerciseLogMapper.toOrm(log);
    return ResultAsync.fromPromise(repo.save(orm), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((saved) => ORMExerciseLogMapper.toDomain(saved));
  }

  @WithPosition()
  delete(id: string): ResultAsync<void, DomainError> {
    const repo = this.getRepository();
    return ResultAsync.fromPromise(repo.delete(id), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map(() => undefined);
  }

  @WithPosition()
  getTotalCaloriesBurnedForDate(
    userId: string,
    date: Date,
  ): ResultAsync<number, DomainError> {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    const dateStr = this.formatDate(date);

    return ResultAsync.fromPromise(
      em
        .createQueryBuilder(ORMExerciseLog, 'log')
        .select('COALESCE(SUM(log.caloriesBurned::numeric), 0)', 'total')
        .where('log.userId = :userId', { userId })
        .andWhere('log.logDate = :date', { date: dateStr })
        .getRawOne(),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((result) => parseFloat(result?.total ?? '0'));
  }

  private formatDate(date: Date): string {
    // Use local date components to avoid timezone issues
    // toISOString() converts to UTC which can shift the date in timezones like Vietnam (UTC+7)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private getEntityManager() {
    if (!this.als) return null;
    const store = this.als.getStore();
    if (!store || !store.ctx) return null;
    return store.ctx;
  }

  private getRepository() {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return em.getRepository(ORMExerciseLog);
  }
}

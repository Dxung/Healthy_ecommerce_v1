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
import { IMealLogRepository } from 'src/modules/meal-plan/repository/meal-log.repository.interface';
import { DailyMealLog } from 'src/modules/meal-plan/models/daily-meal-log.model';
import { MealType } from '../../entities/meal-plan/enums/meal-type.enum';
import { ORMDailyMealLog } from '../../entities/meal-plan';
import { ORMDailyMealLogMapper } from '../../mappers/daily-meal-log.mapper.orm';

@Injectable()
export class OrmMealLogRepository implements IMealLogRepository {
  constructor(
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
    private readonly dataSource: DataSource,
  ) {}

  @WithPosition()
  findById(id: string): ResultAsync<DailyMealLog | null, DomainError> {
    const repo = this.getRepository();
    return ResultAsync.fromPromise(repo.findOne({ where: { id } }), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orm) => (orm ? ORMDailyMealLogMapper.toDomain(orm) : null));
  }

  @WithPosition()
  findByUserAndDate(
    userId: string,
    date: Date,
  ): ResultAsync<DailyMealLog[], DomainError> {
    const repo = this.getRepository();
    const dateStr = this.formatDate(date);

    return ResultAsync.fromPromise(
      repo.find({
        where: {
          userId,
          logDate: dateStr as any,
        },
        order: { mealType: 'ASC', createdAt: 'ASC' },
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orms) => ORMDailyMealLogMapper.toDomainList(orms));
  }

  @WithPosition()
  findByUserAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): ResultAsync<DailyMealLog[], DomainError> {
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
        order: { logDate: 'ASC', mealType: 'ASC', createdAt: 'ASC' },
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orms) => ORMDailyMealLogMapper.toDomainList(orms));
  }

  @WithPosition()
  findByUserDateAndMealType(
    userId: string,
    date: Date,
    mealType: MealType,
  ): ResultAsync<DailyMealLog[], DomainError> {
    const repo = this.getRepository();
    const dateStr = this.formatDate(date);

    return ResultAsync.fromPromise(
      repo.find({
        where: {
          userId,
          logDate: dateStr as any,
          mealType,
        },
        order: { createdAt: 'ASC' },
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orms) => ORMDailyMealLogMapper.toDomainList(orms));
  }

  @WithPosition()
  create(log: DailyMealLog): ResultAsync<DailyMealLog, DomainError> {
    const repo = this.getRepository();
    const orm = ORMDailyMealLogMapper.toOrm(log);
    return ResultAsync.fromPromise(repo.save(orm), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((saved) => ORMDailyMealLogMapper.toDomain(saved));
  }

  @WithPosition()
  update(log: DailyMealLog): ResultAsync<DailyMealLog, DomainError> {
    const repo = this.getRepository();
    const orm = ORMDailyMealLogMapper.toOrm(log);
    return ResultAsync.fromPromise(repo.save(orm), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((saved) => ORMDailyMealLogMapper.toDomain(saved));
  }

  @WithPosition()
  delete(id: string): ResultAsync<void, DomainError> {
    const repo = this.getRepository();
    return ResultAsync.fromPromise(repo.delete(id), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map(() => undefined);
  }

  @WithPosition()
  getLoggedDates(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): ResultAsync<Date[], DomainError> {
    const em = this.getEntityManager() ?? this.dataSource.manager;

    return ResultAsync.fromPromise(
      em
        .createQueryBuilder(ORMDailyMealLog, 'log')
        .select('DISTINCT log.logDate', 'logDate')
        .where('log.userId = :userId', { userId })
        .andWhere('log.logDate BETWEEN :startDate AND :endDate', {
          startDate: this.formatDate(startDate),
          endDate: this.formatDate(endDate),
        })
        .orderBy('log.logDate', 'ASC')
        .getRawMany(),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((results) => results.map((r) => new Date(r.logDate)));
  }

  @WithPosition()
  getTotalCaloriesForDate(
    userId: string,
    date: Date,
  ): ResultAsync<number, DomainError> {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    const dateStr = this.formatDate(date);

    return ResultAsync.fromPromise(
      em
        .createQueryBuilder(ORMDailyMealLog, 'log')
        .select('COALESCE(SUM(log.caloriesLogged::numeric), 0)', 'total')
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
    return em.getRepository(ORMDailyMealLog);
  }
}

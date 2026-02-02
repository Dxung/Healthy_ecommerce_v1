import { Injectable } from '@nestjs/common';
import { DataSource, LessThan, MoreThan, And } from 'typeorm';
import { ResultAsync } from 'neverthrow';
import { AsyncLocalStorage } from 'async_hooks';
import { ITopupRepository } from 'src/modules/payment/repository/topup.repository.interface';
import { Topup } from 'src/modules/payment/models/topup.model';
import { ORMTopup } from '../../entities/payment/orm.topup.entity';
import { ORMTopupMapper } from '../../mappers/topup.mapper.orm';
import { TopupStatus } from '../../entities/payment/enums/topup-status.enum';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { SHARED_ERRORS } from 'src/shared/errors/shared.errors';
import { ITypeORMAlsStore } from 'src/shared/als/interfaces/als-store.interface';

// VNPay keeps transaction data for 48 hours
const VNPAY_DATA_RETENTION_HOURS = 48;

@Injectable()
export class OrmTopupRepository implements ITopupRepository {
  constructor(
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
    private readonly dataSource: DataSource,
  ) {}

  @WithPosition()
  create(topup: Topup): ResultAsync<Topup, DomainError> {
    const repo = this.getRepository();
    const ormTopup = ORMTopupMapper.toOrm(topup);

    return ResultAsync.fromPromise(repo.save(ormTopup), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((saved) => ORMTopupMapper.toDomain(saved));
  }

  @WithPosition()
  findById(id: string): ResultAsync<Topup | null, DomainError> {
    const repo = this.getRepository();

    return ResultAsync.fromPromise(repo.findOne({ where: { id } }), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormTopup) => (ormTopup ? ORMTopupMapper.toDomain(ormTopup) : null));
  }

  @WithPosition()
  findByIdWithLock(id: string): ResultAsync<Topup | null, DomainError> {
    const em = this.getEntityManager();
    if (!em) {
      return ResultAsync.fromPromise(
        Promise.reject(new Error('Transaction context required for locking')),
        (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
      );
    }

    const repo = em.getRepository(ORMTopup);

    return ResultAsync.fromPromise(
      repo.findOne({
        where: { id },
        lock: { mode: 'pessimistic_write' },
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormTopup) => (ormTopup ? ORMTopupMapper.toDomain(ormTopup) : null));
  }

  @WithPosition()
  update(topup: Topup): ResultAsync<Topup, DomainError> {
    const repo = this.getRepository();
    const ormTopup = ORMTopupMapper.toOrm(topup);

    return ResultAsync.fromPromise(repo.save(ormTopup), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((saved) => ORMTopupMapper.toDomain(saved));
  }

  @WithPosition()
  save(topup: Topup): ResultAsync<Topup, DomainError> {
    return this.update(topup);
  }

  @WithPosition()
  findProcessingTopupsForReconcile(
    minutesSinceCreation: number,
    limit: number = 100,
  ): ResultAsync<Topup[], DomainError> {
    const repo = this.getRepository();

    // Find topups that are:
    // 1. Still PROCESSING
    // 2. Created more than X minutes ago (stale)
    // 3. Created less than 48 hours ago (VNPay still has data)
    const cutoffTime = new Date(Date.now() - minutesSinceCreation * 60 * 1000);
    const maxAge = new Date(
      Date.now() - VNPAY_DATA_RETENTION_HOURS * 60 * 60 * 1000,
    );

    return ResultAsync.fromPromise(
      repo.find({
        where: {
          status: TopupStatus.PROCESSING,
          createdAt: And(LessThan(cutoffTime), MoreThan(maxAge)),
        },
        order: { createdAt: 'ASC' },
        take: limit,
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormTopups) => ormTopups.map((orm) => ORMTopupMapper.toDomain(orm)));
  }

  @WithPosition()
  findByWalletId(
    walletId: string,
    options: { page: number; limit: number },
  ): ResultAsync<
    { items: Topup[]; total: number; page: number; limit: number },
    DomainError
  > {
    const repo = this.getRepository();
    const skip = (options.page - 1) * options.limit;

    return ResultAsync.fromPromise(
      repo.findAndCount({
        where: { walletId },
        order: { createdAt: 'DESC' },
        skip,
        take: options.limit,
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map(([ormTopups, total]) => ({
      items: ormTopups.map((orm) => ORMTopupMapper.toDomain(orm)),
      total,
      page: options.page,
      limit: options.limit,
    }));
  }

  private getEntityManager() {
    const store = this.als.getStore();
    if (!store || !store.ctx) return null;
    return store.ctx;
  }

  private getRepository() {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return em.getRepository(ORMTopup);
  }
}

import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { DataSource, In } from 'typeorm';
import { ResultAsync, okAsync } from 'neverthrow';
import { ITypeORMAlsStore } from 'src/shared/als/interfaces/als-store.interface';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { SHARED_ERRORS } from 'src/shared/errors/shared.errors';
import {
  IUnitRepository,
  UnitFilter,
} from 'src/modules/product/repository/unit.repository.interface';
import { Unit } from 'src/modules/product/models/unit.model';
import { ORMUnit } from '../../entities/product';
import { ORMUnitMapper } from '../../mappers/unit.mapper.orm';

@Injectable()
export class OrmUnitRepository implements IUnitRepository {
  constructor(
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
    private readonly dataSource: DataSource,
  ) {}

  @WithPosition()
  findById(id: string): ResultAsync<Unit | null, DomainError> {
    const repo = this.getUnitRepository();
    return ResultAsync.fromPromise(repo.findOne({ where: { id } }), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orm) => (orm ? ORMUnitMapper.toDomain(orm) : null));
  }

  @WithPosition()
  findByIds(ids: string[]): ResultAsync<Unit[], DomainError> {
    if (ids.length === 0) {
      return okAsync([]);
    }
    const repo = this.getUnitRepository();
    return ResultAsync.fromPromise(
      repo.find({ where: { id: In(ids) } }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orms) => ORMUnitMapper.toDomainList(orms));
  }

  @WithPosition()
  findBySymbol(symbol: string): ResultAsync<Unit | null, DomainError> {
    const repo = this.getUnitRepository();
    return ResultAsync.fromPromise(
      repo.findOne({ where: { symbol } }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orm) => (orm ? ORMUnitMapper.toDomain(orm) : null));
  }

  @WithPosition()
  findAll(filter?: UnitFilter): ResultAsync<Unit[], DomainError> {
    const repo = this.getUnitRepository();
    const where: Record<string, unknown> = {};

    if (filter?.category !== undefined) {
      where.category = filter.category;
    }
    if (filter?.isActive !== undefined) {
      where.isActive = filter.isActive;
    }
    if (filter?.isBase !== undefined) {
      where.isBase = filter.isBase;
    }

    return ResultAsync.fromPromise(
      repo.find({
        where,
        order: { name: 'ASC' },
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orms) => ORMUnitMapper.toDomainList(orms));
  }

  @WithPosition()
  create(unit: Unit): ResultAsync<Unit, DomainError> {
    const repo = this.getUnitRepository();
    const orm = ORMUnitMapper.toOrm(unit);
    return ResultAsync.fromPromise(repo.save(orm), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((saved) => ORMUnitMapper.toDomain(saved));
  }

  @WithPosition()
  update(unit: Unit): ResultAsync<Unit, DomainError> {
    const repo = this.getUnitRepository();
    const orm = ORMUnitMapper.toOrm(unit);
    return ResultAsync.fromPromise(repo.save(orm), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((saved) => ORMUnitMapper.toDomain(saved));
  }

  @WithPosition()
  softDelete(id: string): ResultAsync<void, DomainError> {
    const repo = this.getUnitRepository();
    return ResultAsync.fromPromise(repo.softDelete(id), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map(() => undefined);
  }

  @WithPosition()
  symbolExists(
    symbol: string,
    excludeId?: string,
  ): ResultAsync<boolean, DomainError> {
    const repo = this.getUnitRepository();
    return ResultAsync.fromPromise(
      repo
        .createQueryBuilder('unit')
        // Don't include soft-deleted - allow recreating units with same symbol
        .where('unit.symbol = :symbol', { symbol })
        .andWhere(excludeId ? 'unit.id != :excludeId' : '1=1', { excludeId })
        .getExists(),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    );
  }

  private getEntityManager() {
    if (!this.als) return null;
    const store = this.als.getStore();
    if (!store || !store.ctx) return null;
    return store.ctx;
  }

  private getUnitRepository() {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return em.getRepository(ORMUnit);
  }
}

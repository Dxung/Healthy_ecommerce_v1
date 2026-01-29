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
import {
  IUnitConversionRepository,
  UnitConversionFilter,
} from 'src/modules/product/repository/unit-conversion.repository.interface';
import { UnitConversion } from 'src/modules/product/models/unit-conversion.model';
import { ORMUnitConversion } from '../../entities/product';
import { ORMUnitConversionMapper } from '../../mappers/unit-conversion.mapper.orm';

@Injectable()
export class OrmUnitConversionRepository implements IUnitConversionRepository {
  constructor(
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
    private readonly dataSource: DataSource,
  ) {}

  @WithPosition()
  findById(id: string): ResultAsync<UnitConversion | null, DomainError> {
    const repo = this.getConversionRepository();
    return ResultAsync.fromPromise(repo.findOne({ where: { id } }), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orm) => (orm ? ORMUnitConversionMapper.toDomain(orm) : null));
  }

  @WithPosition()
  findByUnitPair(
    fromUnitId: string,
    toUnitId: string,
  ): ResultAsync<UnitConversion | null, DomainError> {
    const repo = this.getConversionRepository();
    return ResultAsync.fromPromise(
      repo.findOne({ where: { fromUnitId, toUnitId } }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orm) => (orm ? ORMUnitConversionMapper.toDomain(orm) : null));
  }

  @WithPosition()
  findAll(
    filter?: UnitConversionFilter,
  ): ResultAsync<UnitConversion[], DomainError> {
    const repo = this.getConversionRepository();
    const where: Record<string, unknown> = {};

    if (filter?.fromUnitId !== undefined) {
      where.fromUnitId = filter.fromUnitId;
    }
    if (filter?.toUnitId !== undefined) {
      where.toUnitId = filter.toUnitId;
    }
    if (filter?.isActive !== undefined) {
      where.isActive = filter.isActive;
    }

    return ResultAsync.fromPromise(
      repo.find({
        where,
        relations: ['fromUnit', 'toUnit'],
        order: { createdAt: 'ASC' },
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orms) => ORMUnitConversionMapper.toDomainList(orms));
  }

  @WithPosition()
  findByUnitId(unitId: string): ResultAsync<UnitConversion[], DomainError> {
    const repo = this.getConversionRepository();
    return ResultAsync.fromPromise(
      repo.find({
        where: [{ fromUnitId: unitId }, { toUnitId: unitId }],
        relations: ['fromUnit', 'toUnit'],
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orms) => ORMUnitConversionMapper.toDomainList(orms));
  }

  @WithPosition()
  create(conversion: UnitConversion): ResultAsync<UnitConversion, DomainError> {
    const repo = this.getConversionRepository();
    const orm = ORMUnitConversionMapper.toOrm(conversion);
    return ResultAsync.fromPromise(repo.save(orm), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((saved) => ORMUnitConversionMapper.toDomain(saved));
  }

  @WithPosition()
  update(conversion: UnitConversion): ResultAsync<UnitConversion, DomainError> {
    const repo = this.getConversionRepository();
    const orm = ORMUnitConversionMapper.toOrm(conversion);
    return ResultAsync.fromPromise(repo.save(orm), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((saved) => ORMUnitConversionMapper.toDomain(saved));
  }

  @WithPosition()
  delete(id: string): ResultAsync<void, DomainError> {
    const repo = this.getConversionRepository();
    return ResultAsync.fromPromise(repo.delete(id), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map(() => undefined);
  }

  @WithPosition()
  conversionExists(
    fromUnitId: string,
    toUnitId: string,
    excludeId?: string,
  ): ResultAsync<boolean, DomainError> {
    const repo = this.getConversionRepository();
    return ResultAsync.fromPromise(
      repo
        .createQueryBuilder('conversion')
        .where('conversion.from_unit_id = :fromUnitId', { fromUnitId })
        .andWhere('conversion.to_unit_id = :toUnitId', { toUnitId })
        .andWhere(excludeId ? 'conversion.id != :excludeId' : '1=1', {
          excludeId,
        })
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

  private getConversionRepository() {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return em.getRepository(ORMUnitConversion);
  }
}

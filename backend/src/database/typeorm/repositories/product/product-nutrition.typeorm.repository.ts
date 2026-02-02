import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { DataSource, In } from 'typeorm';
import { ResultAsync } from 'neverthrow';
import { ITypeORMAlsStore } from 'src/shared/als/interfaces/als-store.interface';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { SHARED_ERRORS } from 'src/shared/errors/shared.errors';
import { IProductNutritionRepository } from 'src/modules/product/repository/product-nutrition.repository.interface';
import { ProductNutrition } from 'src/modules/product/models/product-nutrition.model';
import { ORMProductNutrition } from '../../entities/product/orm.product-nutrition.entity';
import { ORMProductNutritionMapper } from '../../mappers/product-nutrition.mapper.orm';

@Injectable()
export class OrmProductNutritionRepository
  implements IProductNutritionRepository
{
  constructor(
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
    private readonly dataSource: DataSource,
  ) {}

  @WithPosition()
  findByProductId(
    productId: string,
  ): ResultAsync<ProductNutrition | null, DomainError> {
    const repo = this.getRepository();
    return ResultAsync.fromPromise(
      repo.findOne({ where: { productId } }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orm) => (orm ? ORMProductNutritionMapper.toDomain(orm) : null));
  }

  @WithPosition()
  findById(id: string): ResultAsync<ProductNutrition | null, DomainError> {
    const repo = this.getRepository();
    return ResultAsync.fromPromise(repo.findOne({ where: { id } }), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orm) => (orm ? ORMProductNutritionMapper.toDomain(orm) : null));
  }

  @WithPosition()
  create(
    nutrition: ProductNutrition,
  ): ResultAsync<ProductNutrition, DomainError> {
    const repo = this.getRepository();
    const orm = ORMProductNutritionMapper.toOrm(nutrition);
    return ResultAsync.fromPromise(repo.save(orm), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((saved) => ORMProductNutritionMapper.toDomain(saved));
  }

  @WithPosition()
  update(
    nutrition: ProductNutrition,
  ): ResultAsync<ProductNutrition, DomainError> {
    const repo = this.getRepository();
    const orm = ORMProductNutritionMapper.toOrm(nutrition);
    return ResultAsync.fromPromise(repo.save(orm), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((saved) => ORMProductNutritionMapper.toDomain(saved));
  }

  @WithPosition()
  deleteByProductId(productId: string): ResultAsync<void, DomainError> {
    const repo = this.getRepository();
    return ResultAsync.fromPromise(repo.delete({ productId }), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map(() => undefined);
  }

  @WithPosition()
  findByProductIds(
    productIds: string[],
  ): ResultAsync<ProductNutrition[], DomainError> {
    if (productIds.length === 0) {
      return ResultAsync.fromSafePromise(Promise.resolve([]));
    }
    const repo = this.getRepository();
    return ResultAsync.fromPromise(
      repo.find({ where: { productId: In(productIds) } }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orms) => ORMProductNutritionMapper.toDomainList(orms));
  }

  private getEntityManager() {
    if (!this.als) return null;
    const store = this.als.getStore();
    if (!store || !store.ctx) return null;
    return store.ctx;
  }

  private getRepository() {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return em.getRepository(ORMProductNutrition);
  }
}

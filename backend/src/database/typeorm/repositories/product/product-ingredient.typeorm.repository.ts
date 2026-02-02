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
import { IProductIngredientRepository } from 'src/modules/product/repository/product-ingredient.repository.interface';
import { ProductIngredient } from 'src/modules/product/models/product-ingredient.model';
import { ORMProductIngredient } from '../../entities/product';
import { ORMProductMapper } from '../../mappers/product.mapper.orm';

@Injectable()
export class OrmProductIngredientRepository
  implements IProductIngredientRepository
{
  constructor(
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
    private readonly dataSource: DataSource,
  ) {}

  @WithPosition()
  setIngredients(
    productId: string,
    ingredients: ProductIngredient[],
  ): ResultAsync<void, DomainError> {
    const repo = this.getIngredientRepository();

    // Delete existing ingredients then insert new ones
    return ResultAsync.fromPromise(repo.delete({ productId }), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).andThen(() => {
      if (ingredients.length === 0) {
        return ResultAsync.fromSafePromise(Promise.resolve(undefined));
      }

      const ormIngredients = ingredients.map((ing) =>
        ORMProductMapper.ingredientToOrm(ing),
      );

      return ResultAsync.fromPromise(repo.save(ormIngredients), (error) =>
        createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
      ).map(() => undefined);
    });
  }

  @WithPosition()
  findByProductId(
    productId: string,
  ): ResultAsync<ProductIngredient[], DomainError> {
    const repo = this.getIngredientRepository();
    return ResultAsync.fromPromise(
      repo.find({
        where: { productId },
        order: { sortOrder: 'ASC' },
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orms) =>
      orms.map((orm) => ORMProductMapper.ingredientToDomain(orm)),
    );
  }

  @WithPosition()
  deleteByProductId(productId: string): ResultAsync<void, DomainError> {
    const repo = this.getIngredientRepository();
    return ResultAsync.fromPromise(repo.delete({ productId }), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map(() => undefined);
  }

  private getEntityManager() {
    if (!this.als) return null;
    const store = this.als.getStore();
    if (!store || !store.ctx) return null;
    return store.ctx;
  }

  private getIngredientRepository() {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return em.getRepository(ORMProductIngredient);
  }
}

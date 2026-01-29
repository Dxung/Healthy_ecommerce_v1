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
import { IProductOptionRepository } from 'src/modules/product/repository/product-option.repository.interface';
import { ProductOption } from 'src/modules/product/models/product-option.model';
import {
  ORMProductOption,
  ORMProductOptionValue,
} from '../../entities/product';
import { ORMProductMapper } from '../../mappers/product.mapper.orm';
import {
  OPTION_ALIAS,
  OPTION_VALUE_ALIAS,
  OptionColumn,
  QueryParam,
} from './product-query.constants';

@Injectable()
export class OrmProductOptionRepository implements IProductOptionRepository {
  constructor(
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
    private readonly dataSource: DataSource,
  ) {}

  @WithPosition()
  setOptions(
    productId: string,
    options: ProductOption[],
  ): ResultAsync<void, DomainError> {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    const optionRepo = em.getRepository(ORMProductOption);
    const optionValueRepo = em.getRepository(ORMProductOptionValue);

    return ResultAsync.fromPromise(
      (async () => {
        // Delete existing options and values for this product
        const existingOptions = await optionRepo.find({
          where: { productId },
          select: ['id'],
        });
        const existingOptionIds = existingOptions.map((o) => o.id);

        if (existingOptionIds.length > 0) {
          await optionValueRepo
            .createQueryBuilder()
            .delete()
            .where(
              `${OPTION_VALUE_ALIAS}.optionId IN (:...${QueryParam.OPTION_IDS})`,
              {
                [QueryParam.OPTION_IDS]: existingOptionIds,
              },
            )
            .execute();
          await optionRepo.delete({ productId });
        }

        // Insert new options and values
        for (const option of options) {
          const ormOption = ORMProductMapper.optionToOrm(option);
          const savedOption = await optionRepo.save(ormOption);

          for (const value of option.values) {
            const ormValue = ORMProductMapper.optionValueToOrm(value);
            ormValue.optionId = savedOption.id;
            await optionValueRepo.save(ormValue);
          }
        }
      })(),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    );
  }

  @WithPosition()
  getOptions(productId: string): ResultAsync<ProductOption[], DomainError> {
    const optionRepo = this.getOptionRepository();

    return ResultAsync.fromPromise(
      optionRepo
        .createQueryBuilder(OPTION_ALIAS)
        .leftJoinAndSelect(`${OPTION_ALIAS}.values`, OPTION_VALUE_ALIAS)
        .where(`${OptionColumn.PRODUCT_ID} = :${QueryParam.PRODUCT_ID}`, {
          [QueryParam.PRODUCT_ID]: productId,
        })
        .orderBy(OptionColumn.SORT_ORDER, 'ASC')
        .addOrderBy(`${OPTION_VALUE_ALIAS}.sortOrder`, 'ASC')
        .getMany(),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orms) => orms.map((orm) => ORMProductMapper.optionToDomain(orm)));
  }

  @WithPosition()
  deleteByProductId(productId: string): ResultAsync<void, DomainError> {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    const optionRepo = em.getRepository(ORMProductOption);
    const optionValueRepo = em.getRepository(ORMProductOptionValue);

    return ResultAsync.fromPromise(
      (async () => {
        // Find existing options
        const existingOptions = await optionRepo.find({
          where: { productId },
          select: ['id'],
        });
        const existingOptionIds = existingOptions.map((o) => o.id);

        // Delete values first (foreign key constraint)
        if (existingOptionIds.length > 0) {
          await optionValueRepo
            .createQueryBuilder()
            .delete()
            .where(`optionId IN (:...${QueryParam.OPTION_IDS})`, {
              [QueryParam.OPTION_IDS]: existingOptionIds,
            })
            .execute();
        }

        // Delete options
        await optionRepo.delete({ productId });
      })(),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    );
  }

  private getEntityManager() {
    if (!this.als) return null;
    const store = this.als.getStore();
    if (!store || !store.ctx) return null;
    return store.ctx;
  }

  private getOptionRepository() {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return em.getRepository(ORMProductOption);
  }
}

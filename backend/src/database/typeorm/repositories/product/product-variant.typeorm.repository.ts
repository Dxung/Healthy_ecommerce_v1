import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { DataSource, IsNull } from 'typeorm';
import { ResultAsync } from 'neverthrow';
import { ITypeORMAlsStore } from 'src/shared/als/interfaces/als-store.interface';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { SHARED_ERRORS } from 'src/shared/errors/shared.errors';
import {
  IProductVariantRepository,
  VariantWithProduct,
} from 'src/modules/product/repository/product-variant.repository.interface';
import { ProductVariant } from 'src/modules/product/models/product-variant.model';
import {
  ORMProductVariant,
  ORMProductVariantOption,
} from '../../entities/product';
import { ORMProductMapper } from '../../mappers/product.mapper.orm';
import {
  VARIANT_ALIAS,
  VARIANT_OPTION_ALIAS,
  VariantColumn,
  QueryParam,
} from './product-query.constants';

@Injectable()
export class OrmProductVariantRepository implements IProductVariantRepository {
  constructor(
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
    private readonly dataSource: DataSource,
  ) {}

  @WithPosition()
  addVariant(
    variant: ProductVariant,
  ): ResultAsync<ProductVariant, DomainError> {
    const repo = this.getVariantRepository();
    const orm = ORMProductMapper.variantToOrm(variant);

    return ResultAsync.fromPromise(repo.save(orm), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).andThen((saved) => {
      // Link variant to option values if any
      if (variant.optionValueIds.length > 0) {
        return this.setVariantOptionValues(
          saved.id,
          variant.optionValueIds,
        ).map(() => ORMProductMapper.variantToDomain(saved));
      }
      return ResultAsync.fromSafePromise(
        Promise.resolve(ORMProductMapper.variantToDomain(saved)),
      );
    });
  }

  @WithPosition()
  updateVariant(
    variant: ProductVariant,
  ): ResultAsync<ProductVariant, DomainError> {
    const repo = this.getVariantRepository();
    const orm = ORMProductMapper.variantToOrm(variant);

    return ResultAsync.fromPromise(repo.save(orm), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((saved) => ORMProductMapper.variantToDomain(saved));
  }

  @WithPosition()
  softDeleteVariant(variantId: string): ResultAsync<void, DomainError> {
    const repo = this.getVariantRepository();
    return ResultAsync.fromPromise(
      repo.update(variantId, {
        isActive: false,
        deletedAt: new Date(),
        updatedAt: new Date(),
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map(() => undefined);
  }

  @WithPosition()
  getVariants(productId: string): ResultAsync<ProductVariant[], DomainError> {
    const repo = this.getVariantRepository();

    return ResultAsync.fromPromise(
      repo
        .createQueryBuilder(VARIANT_ALIAS)
        .leftJoinAndSelect(
          `${VARIANT_ALIAS}.optionValues`,
          VARIANT_OPTION_ALIAS,
        )
        .where(`${VariantColumn.PRODUCT_ID} = :${QueryParam.PRODUCT_ID}`, {
          [QueryParam.PRODUCT_ID]: productId,
        })
        .orderBy(VariantColumn.CREATED_AT, 'ASC')
        .getMany(),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orms) => orms.map((orm) => ORMProductMapper.variantToDomain(orm)));
  }

  @WithPosition()
  findById(variantId: string): ResultAsync<ProductVariant | null, DomainError> {
    const repo = this.getVariantRepository();

    return ResultAsync.fromPromise(
      repo
        .createQueryBuilder(VARIANT_ALIAS)
        .leftJoinAndSelect(
          `${VARIANT_ALIAS}.optionValues`,
          VARIANT_OPTION_ALIAS,
        )
        .where(`${VariantColumn.ID} = :${QueryParam.VARIANT_ID}`, {
          [QueryParam.VARIANT_ID]: variantId,
        })
        .getOne(),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orm) => (orm ? ORMProductMapper.variantToDomain(orm) : null));
  }

  @WithPosition()
  getActiveVariantCount(productId: string): ResultAsync<number, DomainError> {
    const repo = this.getVariantRepository();
    return ResultAsync.fromPromise(
      repo.count({
        where: { productId, isActive: true, deletedAt: IsNull() },
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    );
  }

  @WithPosition()
  setVariantOptionValues(
    variantId: string,
    optionValueIds: string[],
  ): ResultAsync<void, DomainError> {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    const variantOptionRepo = em.getRepository(ORMProductVariantOption);

    return ResultAsync.fromPromise(
      (async () => {
        // Delete existing variant-option links
        await variantOptionRepo.delete({ variantId });

        // Create new links
        const links = optionValueIds.map((optionValueId) =>
          ORMProductMapper.variantOptionToOrm(variantId, optionValueId),
        );

        if (links.length > 0) {
          await variantOptionRepo.save(links);
        }
      })(),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    );
  }

  @WithPosition()
  deleteByProductId(productId: string): ResultAsync<void, DomainError> {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    const variantRepo = em.getRepository(ORMProductVariant);
    const variantOptionRepo = em.getRepository(ORMProductVariantOption);

    return ResultAsync.fromPromise(
      (async () => {
        // Find existing variants
        const existingVariants = await variantRepo.find({
          where: { productId },
          select: ['id'],
        });
        const existingVariantIds = existingVariants.map((v) => v.id);

        // Delete variant-option links first (foreign key constraint)
        if (existingVariantIds.length > 0) {
          await variantOptionRepo
            .createQueryBuilder()
            .delete()
            .where(`variantId IN (:...ids)`, { ids: existingVariantIds })
            .execute();
        }

        // Delete variants
        await variantRepo.delete({ productId });
      })(),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    );
  }

  @WithPosition()
  findByIdWithProduct(
    variantId: string,
  ): ResultAsync<VariantWithProduct | null, DomainError> {
    const repo = this.getVariantRepository();

    return ResultAsync.fromPromise(
      repo.findOne({
        where: { id: variantId },
        relations: ['product'],
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orm) => {
      if (!orm || !orm.product) return null;
      return {
        id: orm.id,
        productId: orm.productId,
        sku: orm.sku,
        name: orm.name,
        price: Number(orm.price),
        compareAtPrice: orm.compareAtPrice ? Number(orm.compareAtPrice) : null,
        stockQuantity: orm.stockQuantity,
        imageUrl: orm.imageUrl,
        isActive: orm.isActive,
        deletedAt: orm.deletedAt,
        product: {
          id: orm.product.id,
          shopId: orm.product.shopId,
          name: orm.product.name,
          slug: orm.product.slug,
          thumbnailUrl: orm.product.thumbnailUrl,
          isVisible: orm.product.isVisible,
          status: orm.product.status,
        },
      };
    });
  }

  private getEntityManager() {
    if (!this.als) return null;
    const store = this.als.getStore();
    if (!store || !store.ctx) return null;
    return store.ctx;
  }

  private getVariantRepository() {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return em.getRepository(ORMProductVariant);
  }
}

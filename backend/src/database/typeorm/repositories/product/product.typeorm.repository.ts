import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { DataSource, SelectQueryBuilder } from 'typeorm';
import { ResultAsync } from 'neverthrow';
import { ITypeORMAlsStore } from 'src/shared/als/interfaces/als-store.interface';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { SHARED_ERRORS } from 'src/shared/errors/shared.errors';
import {
  IProductRepository,
  ProductFilter,
  PublicProductFilter,
  ProductLoadOptions,
} from 'src/modules/product/repository/product.repository.interface';
import {
  PaginationParams,
  PaginatedResult,
  createPaginatedResult,
} from 'src/shared/types/pagination.type';
import { Product } from 'src/modules/product/models/product.model';
import { ProductStatus } from '../../entities/product/enums/product-status.enum';
import { ORMProduct } from '../../entities/product';
import { ORMProductMapper } from '../../mappers/product.mapper.orm';
import {
  PRODUCT_ALIAS,
  IMAGE_ALIAS,
  VARIANT_ALIAS,
  ProductColumn,
  QueryParam,
  ProductRelation,
} from './product-query.constants';

@Injectable()
export class OrmProductRepository implements IProductRepository {
  constructor(
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
    private readonly dataSource: DataSource,
  ) {}

  @WithPosition()
  findById(
    id: string,
    options?: ProductLoadOptions,
  ): ResultAsync<Product | null, DomainError> {
    const repo = this.getProductRepository();
    const relations = this.buildRelations(options);

    return ResultAsync.fromPromise(
      repo.findOne({ where: { id }, relations }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orm) => (orm ? ORMProductMapper.toDomain(orm) : null));
  }

  @WithPosition()
  findBySlugAndShop(
    shopId: string,
    slug: string,
    options?: ProductLoadOptions,
  ): ResultAsync<Product | null, DomainError> {
    const repo = this.getProductRepository();
    const relations = this.buildRelations(options);

    return ResultAsync.fromPromise(
      repo.findOne({ where: { shopId, slug }, relations }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orm) => (orm ? ORMProductMapper.toDomain(orm) : null));
  }

  @WithPosition()
  findByShopId(
    shopId: string,
    pagination: PaginationParams,
    filter?: Omit<ProductFilter, 'shopId'>,
  ): ResultAsync<PaginatedResult<Product>, DomainError> {
    const repo = this.getProductRepository();
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const qb = repo
      .createQueryBuilder(PRODUCT_ALIAS)
      .leftJoinAndSelect(
        `${PRODUCT_ALIAS}.${ProductRelation.IMAGES}`,
        IMAGE_ALIAS,
      )
      .leftJoinAndSelect(
        `${PRODUCT_ALIAS}.${ProductRelation.VARIANTS}`,
        VARIANT_ALIAS,
      )
      .where(`${ProductColumn.SHOP_ID} = :${QueryParam.SHOP_ID}`, {
        [QueryParam.SHOP_ID]: shopId,
      });

    this.applyFilters(qb, filter);

    qb.orderBy(ProductColumn.CREATED_AT, 'DESC').skip(skip).take(limit);

    return ResultAsync.fromPromise(qb.getManyAndCount(), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map(([orms, total]) => {
      const items = ORMProductMapper.toDomainList(orms);
      return createPaginatedResult(items, total, page, limit);
    });
  }

  @WithPosition()
  findAll(
    pagination: PaginationParams,
    filter?: ProductFilter,
  ): ResultAsync<PaginatedResult<Product>, DomainError> {
    const repo = this.getProductRepository();
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const qb = repo
      .createQueryBuilder(PRODUCT_ALIAS)
      .leftJoinAndSelect(
        `${PRODUCT_ALIAS}.${ProductRelation.IMAGES}`,
        IMAGE_ALIAS,
      )
      .leftJoinAndSelect(
        `${PRODUCT_ALIAS}.${ProductRelation.VARIANTS}`,
        VARIANT_ALIAS,
      );

    this.applyFilters(qb, filter);

    qb.orderBy(ProductColumn.CREATED_AT, 'DESC').skip(skip).take(limit);

    return ResultAsync.fromPromise(qb.getManyAndCount(), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map(([orms, total]) => {
      const items = ORMProductMapper.toDomainList(orms);
      return createPaginatedResult(items, total, page, limit);
    });
  }

  @WithPosition()
  findPublic(
    pagination: PaginationParams,
    filter?: PublicProductFilter,
  ): ResultAsync<PaginatedResult<Product>, DomainError> {
    const repo = this.getProductRepository();
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const qb = repo
      .createQueryBuilder(PRODUCT_ALIAS)
      .leftJoinAndSelect(
        `${PRODUCT_ALIAS}.${ProductRelation.IMAGES}`,
        IMAGE_ALIAS,
      )
      .leftJoinAndSelect(
        `${PRODUCT_ALIAS}.${ProductRelation.VARIANTS}`,
        VARIANT_ALIAS,
      )
      .where(`${ProductColumn.STATUS} = :${QueryParam.STATUS}`, {
        [QueryParam.STATUS]: ProductStatus.ACTIVE,
      })
      .andWhere(`${ProductColumn.IS_VISIBLE} = :${QueryParam.IS_VISIBLE}`, {
        [QueryParam.IS_VISIBLE]: true,
      });

    // Category filter: categoryIds takes precedence over categoryId
    if (filter?.categoryIds?.length) {
      qb.andWhere(`${ProductColumn.CATEGORY_ID} IN (:...categoryIds)`, {
        categoryIds: filter.categoryIds,
      });
    } else if (filter?.categoryId) {
      qb.andWhere(`${ProductColumn.CATEGORY_ID} = :${QueryParam.CATEGORY_ID}`, {
        [QueryParam.CATEGORY_ID]: filter.categoryId,
      });
    }
    if (filter?.brandId) {
      qb.andWhere(`${ProductColumn.BRAND_ID} = :${QueryParam.BRAND_ID}`, {
        [QueryParam.BRAND_ID]: filter.brandId,
      });
    }
    if (filter?.minPrice !== undefined && filter?.maxPrice !== undefined) {
      qb.andWhere(`${ProductColumn.MIN_PRICE} >= :${QueryParam.MIN_PRICE}`, {
        [QueryParam.MIN_PRICE]: filter.minPrice,
      });
      qb.andWhere(`${ProductColumn.MAX_PRICE} <= :${QueryParam.MAX_PRICE}`, {
        [QueryParam.MAX_PRICE]: filter.maxPrice,
      });
    } else if (filter?.minPrice !== undefined) {
      qb.andWhere(`${ProductColumn.MIN_PRICE} >= :${QueryParam.MIN_PRICE}`, {
        [QueryParam.MIN_PRICE]: filter.minPrice,
      });
    } else if (filter?.maxPrice !== undefined) {
      qb.andWhere(`${ProductColumn.MAX_PRICE} <= :${QueryParam.MAX_PRICE}`, {
        [QueryParam.MAX_PRICE]: filter.maxPrice,
      });
    }
    if (filter?.search) {
      qb.andWhere(`${ProductColumn.NAME} ILIKE :${QueryParam.SEARCH}`, {
        [QueryParam.SEARCH]: `%${filter.search}%`,
      });
    }

    // Diet tags filter: Products must have ALL specified diet tags
    if (filter?.dietTagIds?.length) {
      qb.andWhere(
        `${ProductColumn.ID} IN (
          SELECT pdt.product_id
          FROM product_schema.product_diet_tags pdt
          WHERE pdt.diet_tag_id = ANY(:${QueryParam.DIET_TAG_IDS})
          GROUP BY pdt.product_id
          HAVING COUNT(DISTINCT pdt.diet_tag_id) = :${QueryParam.DIET_TAG_COUNT}
        )`,
        {
          [QueryParam.DIET_TAG_IDS]: filter.dietTagIds,
          [QueryParam.DIET_TAG_COUNT]: filter.dietTagIds.length,
        },
      );
    }

    // Allergen-free filter: Exclude products that have ANY of these allergen tags
    if (filter?.allergenFreeIds?.length) {
      qb.andWhere(
        `NOT EXISTS (
          SELECT 1
          FROM product_schema.product_allergen_tags pat
          WHERE pat.product_id = ${ProductColumn.ID}
            AND pat.allergen_tag_id = ANY(:${QueryParam.ALLERGEN_FREE_IDS})
        )`,
        {
          [QueryParam.ALLERGEN_FREE_IDS]: filter.allergenFreeIds,
        },
      );
    }

    // Apply sorting with badge search boost when searching
    // Shop badges can provide a search_boost_multiplier that increases product visibility
    const hasSearchBoost = filter?.search && !filter?.sortBy;

    if (hasSearchBoost) {
      // When searching without explicit sort, apply badge boost to relevance
      // Get max search_boost_multiplier for each shop from active badge assignments
      qb.addSelect(
        `COALESCE((
          SELECT MAX(sb.search_boost_multiplier)
          FROM shop_schema.shop_badge_assignments sba
          JOIN shop_schema.shop_badges sb ON sb.code = sba.badge_code AND sb.is_active = true
          WHERE sba.shop_id = ${PRODUCT_ALIAS}.shop_id
            AND sba.status = 'active'
            AND sb.search_boost_multiplier IS NOT NULL
        ), 1)`,
        'shop_boost',
      );
      // Order by boosted relevance (newer products with higher boost first)
      qb.orderBy('shop_boost', 'DESC');
      qb.addOrderBy(ProductColumn.CREATED_AT, 'DESC');
    } else {
      // Apply explicit sorting
      switch (filter?.sortBy) {
        case 'price_asc':
          qb.orderBy(ProductColumn.MIN_PRICE, 'ASC');
          break;
        case 'price_desc':
          qb.orderBy(ProductColumn.MIN_PRICE, 'DESC');
          break;
        case 'best_selling':
          qb.orderBy(ProductColumn.TOTAL_SOLD, 'DESC');
          break;
        case 'rating':
          qb.orderBy(ProductColumn.AVERAGE_RATING, 'DESC');
          break;
        case 'newest':
        default:
          qb.orderBy(ProductColumn.CREATED_AT, 'DESC');
          break;
      }
    }

    qb.skip(skip).take(limit);

    return ResultAsync.fromPromise(qb.getManyAndCount(), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map(([orms, total]) => {
      const items = ORMProductMapper.toDomainList(orms);
      return createPaginatedResult(items, total, page, limit);
    });
  }

  @WithPosition()
  slugExistsInShop(
    shopId: string,
    slug: string,
    excludeId?: string,
  ): ResultAsync<boolean, DomainError> {
    const repo = this.getProductRepository();
    const qb = repo
      .createQueryBuilder(PRODUCT_ALIAS)
      .where(`${ProductColumn.SHOP_ID} = :${QueryParam.SHOP_ID}`, {
        [QueryParam.SHOP_ID]: shopId,
      })
      .andWhere(`${ProductColumn.SLUG} = :${QueryParam.SLUG}`, {
        [QueryParam.SLUG]: slug,
      });

    if (excludeId) {
      qb.andWhere(`${ProductColumn.ID} != :${QueryParam.EXCLUDE_ID}`, {
        [QueryParam.EXCLUDE_ID]: excludeId,
      });
    }

    return ResultAsync.fromPromise(qb.getExists(), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    );
  }

  @WithPosition()
  create(product: Product): ResultAsync<Product, DomainError> {
    const repo = this.getProductRepository();
    const orm = ORMProductMapper.toOrm(product);

    return ResultAsync.fromPromise(repo.save(orm), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((saved) => ORMProductMapper.toDomain(saved));
  }

  @WithPosition()
  update(product: Product): ResultAsync<Product, DomainError> {
    const repo = this.getProductRepository();
    const orm = ORMProductMapper.toOrm(product);

    return ResultAsync.fromPromise(repo.save(orm), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((saved) => ORMProductMapper.toDomain(saved));
  }

  @WithPosition()
  softDelete(id: string): ResultAsync<void, DomainError> {
    const repo = this.getProductRepository();
    return ResultAsync.fromPromise(
      repo.update(id, {
        status: ProductStatus.DELETED,
        deletedAt: new Date(),
        updatedAt: new Date(),
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map(() => undefined);
  }

  @WithPosition()
  hardDelete(id: string): ResultAsync<void, DomainError> {
    const repo = this.getProductRepository();
    return ResultAsync.fromPromise(repo.delete(id), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map(() => undefined);
  }

  @WithPosition()
  countActiveByShopId(shopId: string): ResultAsync<number, DomainError> {
    const repo = this.getProductRepository();
    return ResultAsync.fromPromise(
      repo.count({
        where: {
          shopId,
          deletedAt: null as unknown as Date,
        },
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    );
  }

  @WithPosition()
  updateRating(
    productId: string,
    averageRating: number,
    totalRatings: number,
  ): ResultAsync<void, DomainError> {
    const repo = this.getProductRepository();
    return ResultAsync.fromPromise(
      repo.update(productId, {
        averageRating,
        totalRatings,
        updatedAt: new Date(),
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map(() => undefined);
  }

  @WithPosition()
  updateOfficialStatus(
    shopId: string,
    brandId: string,
    isOfficialApproved: boolean,
  ): ResultAsync<number, DomainError> {
    const repo = this.getProductRepository();
    return ResultAsync.fromPromise(
      repo.update(
        { shopId, brandId },
        {
          isOfficialApproved,
          updatedAt: new Date(),
        },
      ),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((result) => result.affected ?? 0);
  }

  // ======================== PRIVATE HELPERS ========================

  private buildRelations(options?: ProductLoadOptions): string[] {
    const relations: string[] = [];
    if (options?.withImages) relations.push(ProductRelation.IMAGES);
    if (options?.withOptions) {
      relations.push(ProductRelation.OPTIONS, ProductRelation.OPTIONS_VALUES);
    }
    if (options?.withVariants) {
      relations.push(
        ProductRelation.VARIANTS,
        ProductRelation.VARIANTS_OPTION_VALUES,
      );
      // Include selling unit for variants if units requested
      if (options?.withUnits) {
        relations.push(ProductRelation.VARIANTS_SELLING_UNIT);
      }
    }
    if (options?.withUnits) {
      relations.push(ProductRelation.SERVING_UNIT);
    }
    return relations;
  }

  private applyFilters(
    qb: SelectQueryBuilder<ORMProduct>,
    filter?: ProductFilter,
  ): void {
    if (filter?.shopId) {
      qb.andWhere(`${ProductColumn.SHOP_ID} = :${QueryParam.SHOP_ID}`, {
        [QueryParam.SHOP_ID]: filter.shopId,
      });
    }
    if (filter?.categoryId) {
      qb.andWhere(`${ProductColumn.CATEGORY_ID} = :${QueryParam.CATEGORY_ID}`, {
        [QueryParam.CATEGORY_ID]: filter.categoryId,
      });
    }
    if (filter?.brandId) {
      qb.andWhere(`${ProductColumn.BRAND_ID} = :${QueryParam.BRAND_ID}`, {
        [QueryParam.BRAND_ID]: filter.brandId,
      });
    }
    if (filter?.status) {
      qb.andWhere(`${ProductColumn.STATUS} = :${QueryParam.STATUS}`, {
        [QueryParam.STATUS]: filter.status,
      });
    }
    if (filter?.isVisible !== undefined) {
      qb.andWhere(`${ProductColumn.IS_VISIBLE} = :${QueryParam.IS_VISIBLE}`, {
        [QueryParam.IS_VISIBLE]: filter.isVisible,
      });
    }
    if (filter?.search) {
      qb.andWhere(`${ProductColumn.NAME} ILIKE :${QueryParam.SEARCH}`, {
        [QueryParam.SEARCH]: `%${filter.search}%`,
      });
    }
  }

  private getEntityManager() {
    if (!this.als) return null;
    const store = this.als.getStore();
    if (!store || !store.ctx) return null;
    return store.ctx;
  }

  private getProductRepository() {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return em.getRepository(ORMProduct);
  }
}

import { Injectable } from '@nestjs/common';
import { IShopOfficialBrandRepository } from 'src/modules/shop/repository/shop-official-brand.repository.interface';
import { ORMShopOfficialBrandMapper } from '../../mappers/shop-official-brand.mapper.orm';
import { ShopOfficialBrand } from 'src/modules/shop/models/shop-official-brand.model';
import { AsyncLocalStorage } from 'async_hooks';
import { ITypeORMAlsStore } from 'src/shared/als/interfaces/als-store.interface';
import { DataSource, IsNull, LessThan, MoreThan } from 'typeorm';
import { ORMShopOfficialBrand } from '../../entities/shop';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { SHARED_ERRORS } from 'src/shared/errors/shared.errors';
import { ResultAsync, okAsync } from 'neverthrow';

@Injectable()
export class OrmShopOfficialBrandRepository implements IShopOfficialBrandRepository {
  constructor(
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
    private readonly dataSource: DataSource,
  ) {}

  @WithPosition()
  create(officialBrand: ShopOfficialBrand): ResultAsync<ShopOfficialBrand, DomainError> {
    const repo = this.getRepository();
    const ormEntity = ORMShopOfficialBrandMapper.toOrm(officialBrand);

    return ResultAsync.fromPromise(
      repo.save(ormEntity),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((saved) => ORMShopOfficialBrandMapper.toDomain(saved));
  }

  @WithPosition()
  findByShopAndBrand(
    shopId: string,
    brandId: string,
  ): ResultAsync<ShopOfficialBrand | null, DomainError> {
    const repo = this.getRepository();
    return ResultAsync.fromPromise(
      repo.findOne({
        where: { shopId, brandId },
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormEntity) => {
      if (!ormEntity) return null;
      return ORMShopOfficialBrandMapper.toDomain(ormEntity);
    });
  }

  @WithPosition()
  isOfficialForBrand(shopId: string, brandId: string): ResultAsync<boolean, DomainError> {
    const repo = this.getRepository();
    const now = new Date();

    return ResultAsync.fromPromise(
      repo.exists({
        where: {
          shopId,
          brandId,
          revokedAt: IsNull(),
          expiresAt: MoreThan(now),
        },
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    );
  }

  @WithPosition()
  findActiveByShop(shopId: string): ResultAsync<ShopOfficialBrand[], DomainError> {
    const repo = this.getRepository();
    const now = new Date();

    return ResultAsync.fromPromise(
      repo.find({
        where: {
          shopId,
          revokedAt: IsNull(),
          expiresAt: MoreThan(now),
        },
        order: { grantedAt: 'DESC' },
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormEntities) => ORMShopOfficialBrandMapper.toDomainList(ormEntities));
  }

  @WithPosition()
  findActiveBrandIdsByShop(shopId: string): ResultAsync<string[], DomainError> {
    const repo = this.getRepository();
    const now = new Date();

    return ResultAsync.fromPromise(
      repo.find({
        where: {
          shopId,
          revokedAt: IsNull(),
          expiresAt: MoreThan(now),
        },
        select: ['brandId'],
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormEntities) => ormEntities.map((e) => e.brandId));
  }

  @WithPosition()
  update(officialBrand: ShopOfficialBrand): ResultAsync<ShopOfficialBrand, DomainError> {
    const repo = this.getRepository();

    return ResultAsync.fromPromise(
      repo.update(officialBrand.id, {
        revokedAt: officialBrand.revokedAt,
        revokedReason: officialBrand.revokedReason,
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).andThen(() => {
      return this.findById(officialBrand.id).map((result) => {
        if (!result) {
          throw new Error('Failed to fetch updated shop official brand');
        }
        return result;
      });
    });
  }

  @WithPosition()
  findExpiredNotRevoked(): ResultAsync<ShopOfficialBrand[], DomainError> {
    const repo = this.getRepository();
    const now = new Date();

    return ResultAsync.fromPromise(
      repo.find({
        where: {
          revokedAt: IsNull(),
          expiresAt: LessThan(now),
        },
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormEntities) => ORMShopOfficialBrandMapper.toDomainList(ormEntities));
  }

  @WithPosition()
  hasAnyActiveOfficialBrand(shopId: string): ResultAsync<boolean, DomainError> {
    const repo = this.getRepository();
    const now = new Date();

    return ResultAsync.fromPromise(
      repo.exists({
        where: {
          shopId,
          revokedAt: IsNull(),
          expiresAt: MoreThan(now),
        },
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    );
  }

  // ======================== HELPERS ========================

  private findById(id: string): ResultAsync<ShopOfficialBrand | null, DomainError> {
    const repo = this.getRepository();
    return ResultAsync.fromPromise(
      repo.findOne({ where: { id } }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormEntity) => {
      if (!ormEntity) return null;
      return ORMShopOfficialBrandMapper.toDomain(ormEntity);
    });
  }

  private getEntityManager() {
    if (!this.als) return null;
    const store = this.als.getStore();
    if (!store || !store.ctx) return null;
    return store.ctx;
  }

  private getRepository() {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return em.getRepository(ORMShopOfficialBrand);
  }
}

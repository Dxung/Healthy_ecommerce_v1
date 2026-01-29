import { Injectable } from '@nestjs/common';
import { IShopBadgeRepository } from 'src/modules/shop/repository/shop-badge.repository.interface';
import { ORMShopBadgeMapper } from '../../mappers/shop-badge.mapper.orm';
import { ShopBadge } from 'src/modules/shop/models/shop-badge.model';
import { ShopBadgeCode } from '../../entities/shop/enums/shop-badge-code.enum';
import { AsyncLocalStorage } from 'async_hooks';
import { ITypeORMAlsStore } from 'src/shared/als/interfaces/als-store.interface';
import { DataSource } from 'typeorm';
import { ORMShopBadge } from '../../entities/shop';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { SHARED_ERRORS } from 'src/shared/errors/shared.errors';
import { SHOP_ERRORS } from 'src/modules/shop/errors/shop.errors';
import { ResultAsync, errAsync, okAsync } from 'neverthrow';

@Injectable()
export class OrmShopBadgeRepository implements IShopBadgeRepository {
  constructor(
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
    private readonly dataSource: DataSource,
  ) {}

  @WithPosition()
  findAll(includeRequirements = false): ResultAsync<ShopBadge[], DomainError> {
    const repo = this.getRepository();
    const relations = includeRequirements
      ? ['requirements', 'requirements.documentType']
      : [];

    return ResultAsync.fromPromise(
      repo.find({
        order: { code: 'ASC' },
        relations,
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormBadges) => ORMShopBadgeMapper.toDomainList(ormBadges));
  }

  @WithPosition()
  findAllActive(
    includeRequirements = false,
  ): ResultAsync<ShopBadge[], DomainError> {
    const repo = this.getRepository();
    const relations = includeRequirements
      ? ['requirements', 'requirements.documentType']
      : [];

    return ResultAsync.fromPromise(
      repo.find({
        where: { isActive: true },
        order: { code: 'ASC' },
        relations,
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormBadges) => ORMShopBadgeMapper.toDomainList(ormBadges));
  }

  @WithPosition()
  findByCode(
    code: ShopBadgeCode,
    includeRequirements = false,
  ): ResultAsync<ShopBadge | null, DomainError> {
    const repo = this.getRepository();
    const relations = includeRequirements
      ? ['requirements', 'requirements.documentType']
      : [];

    return ResultAsync.fromPromise(
      repo.findOne({
        where: { code },
        relations,
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormBadge) => {
      if (!ormBadge) return null;
      return ORMShopBadgeMapper.toDomain(ormBadge);
    });
  }

  @WithPosition()
  findById(
    id: string,
    includeRequirements = false,
  ): ResultAsync<ShopBadge | null, DomainError> {
    const repo = this.getRepository();
    const relations = includeRequirements
      ? ['requirements', 'requirements.documentType']
      : [];

    return ResultAsync.fromPromise(
      repo.findOne({
        where: { id },
        relations,
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormBadge) => {
      if (!ormBadge) return null;
      return ORMShopBadgeMapper.toDomain(ormBadge);
    });
  }

  @WithPosition()
  update(badge: ShopBadge): ResultAsync<ShopBadge, DomainError> {
    const repo = this.getRepository();

    return ResultAsync.fromPromise(
      repo.update(badge.id, {
        isActive: badge.isActive,
        updatedAt: badge.updatedAt,
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).andThen((updateResult) => {
      if (updateResult.affected === 0) {
        return errAsync(
          createDomainError(SHOP_ERRORS.BADGE_NOT_FOUND, {
            cause: SHOP_ERRORS.BADGE_NOT_FOUND.message,
          }),
        );
      }
      return this.findById(badge.id).andThen((result) => {
        if (!result) {
          return errAsync(
            createDomainError(SHARED_ERRORS.DB_ERROR, {
              cause: SHARED_ERRORS.DB_ERROR.message,
            }),
          );
        }
        return okAsync(result);
      });
    });
  }

  // ======================== HELPERS ========================

  private getEntityManager() {
    if (!this.als) return null;
    const store = this.als.getStore();
    if (!store || !store.ctx) return null;
    return store.ctx;
  }

  private getRepository() {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return em.getRepository(ORMShopBadge);
  }
}

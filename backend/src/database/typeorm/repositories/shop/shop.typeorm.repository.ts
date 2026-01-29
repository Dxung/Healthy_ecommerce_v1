import { Injectable } from '@nestjs/common';
import {
  IShopRepository,
  AdminShopFilters,
} from 'src/modules/shop/repository/shop.repository.interface';
import { ORMShopMapper } from '../../mappers/shop.mapper.orm';
import { ORMShopBadgeAssignmentMapper } from '../../mappers/shop-badge-assignment.mapper.orm';
import { Shop } from 'src/modules/shop/models/shop.model';
import { ShopBadgeAssignment } from 'src/modules/shop/models/shop-badge-assignment.model';
import { AsyncLocalStorage } from 'async_hooks';
import { ITypeORMAlsStore } from 'src/shared/als/interfaces/als-store.interface';
import { DataSource, ILike } from 'typeorm';
import { ORMShop, ORMShopBadgeAssignment } from '../../entities/shop';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { SHARED_ERRORS } from 'src/shared/errors/shared.errors';
import { SHOP_ERRORS } from 'src/modules/shop/errors/shop.errors';
import { ResultAsync, errAsync, okAsync } from 'neverthrow';
import { isQueryFailedPostgresError } from '../../guards/type-guard.database';
import { PG_UNIQUE_VIOLATION } from 'src/database/constant/postgresql-error.constant';
import { sanitizePostgresError } from '../../guards/sanitize-postgres-error.util';
import {
  PaginatedResult,
  PaginationParams,
  createPaginatedResult,
} from 'src/shared/types/pagination.type';
import { ShopStatus } from '../../entities/shop/enums/shop-status.enum';

@Injectable()
export class OrmShopRepository implements IShopRepository {
  constructor(
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
    private readonly dataSource: DataSource,
  ) {}

  @WithPosition()
  create(shop: Shop): ResultAsync<Shop, DomainError> {
    const repo = this.getShopRepository();
    const ormShop = ORMShopMapper.toOrm(shop);

    return ResultAsync.fromPromise(repo.save(ormShop), (error) => {
      if (isQueryFailedPostgresError(error)) {
        const safeError = sanitizePostgresError(error.driverError);

        if (error.driverError.code === PG_UNIQUE_VIOLATION) {
          // Check constraint name to determine which field caused the violation
          if (error.driverError.constraint === 'shops_slug_key') {
            return createDomainError(SHOP_ERRORS.SLUG_ALREADY_EXISTS, {
              cause: safeError,
            });
          }
          if (error.driverError.constraint === 'shops_user_id_key') {
            return createDomainError(SHOP_ERRORS.ALREADY_HAS_SHOP, {
              cause: safeError,
            });
          }
        }
      }
      return createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error });
    }).andThen(() => {
      // Fetch with relations
      return this.findById(shop.id).andThen((result) => {
        if (!result) {
          return errAsync(
            createDomainError(SHARED_ERRORS.DB_ERROR, {
              cause: 'Failed to fetch created shop',
            }),
          );
        }
        return okAsync(result);
      });
    });
  }

  @WithPosition()
  findById(id: string): ResultAsync<Shop | null, DomainError> {
    const repo = this.getShopRepository();
    return ResultAsync.fromPromise(
      repo.findOne({
        where: { id },
        relations: ['badgeAssignments'],
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormShop) => {
      if (!ormShop) return null;
      return ORMShopMapper.toDomain(ormShop);
    });
  }

  @WithPosition()
  findByUserId(userId: string): ResultAsync<Shop | null, DomainError> {
    const repo = this.getShopRepository();
    return ResultAsync.fromPromise(
      repo.findOne({
        where: { userId },
        relations: ['badgeAssignments'],
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormShop) => {
      if (!ormShop) return null;
      return ORMShopMapper.toDomain(ormShop);
    });
  }

  @WithPosition()
  findBySlug(slug: string): ResultAsync<Shop | null, DomainError> {
    const repo = this.getShopRepository();
    return ResultAsync.fromPromise(
      repo.findOne({
        where: { slug },
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormShop) => {
      if (!ormShop) return null;
      return ORMShopMapper.toDomain(ormShop);
    });
  }

  @WithPosition()
  existsBySlug(slug: string): ResultAsync<boolean, DomainError> {
    const repo = this.getShopRepository();
    return ResultAsync.fromPromise(repo.exists({ where: { slug } }), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    );
  }

  @WithPosition()
  existsByUserId(userId: string): ResultAsync<boolean, DomainError> {
    const repo = this.getShopRepository();
    return ResultAsync.fromPromise(
      repo.exists({ where: { userId } }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    );
  }

  @WithPosition()
  update(shop: Shop): ResultAsync<Shop, DomainError> {
    const repo = this.getShopRepository();
    const ormShop = ORMShopMapper.toOrm(shop);

    return ResultAsync.fromPromise(
      repo.update(shop.id, {
        phone: ormShop.phone,
        email: ormShop.email,
        addressLine: ormShop.addressLine,
        wardId: ormShop.wardId,
        districtId: ormShop.districtId,
        provinceId: ormShop.provinceId,
        logoUrl: ormShop.logoUrl,
        coverUrl: ormShop.coverUrl,
        status: ormShop.status,
        updatedAt: ormShop.updatedAt,
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).andThen((updateResult) => {
      if (updateResult.affected === 0) {
        return errAsync(
          createDomainError(SHOP_ERRORS.SHOP_NOT_FOUND, {
            cause: 'Shop not found for update',
          }),
        );
      }
      return this.findById(shop.id).andThen((result) => {
        if (!result) {
          return errAsync(
            createDomainError(SHARED_ERRORS.DB_ERROR, {
              cause: 'Failed to fetch updated shop',
            }),
          );
        }
        return okAsync(result);
      });
    });
  }

  // ======================== BADGE METHODS ========================

  @WithPosition()
  createBadgeAssignment(
    badge: ShopBadgeAssignment,
  ): ResultAsync<ShopBadgeAssignment, DomainError> {
    const repo = this.getBadgeRepository();
    const ormBadge = ORMShopBadgeAssignmentMapper.toOrm(badge);

    return ResultAsync.fromPromise(repo.save(ormBadge), (error) => {
      if (isQueryFailedPostgresError(error)) {
        const safeError = sanitizePostgresError(error.driverError);

        if (error.driverError.code === PG_UNIQUE_VIOLATION) {
          if (error.driverError.constraint === 'uq_shop_badge') {
            return createDomainError(SHOP_ERRORS.BADGE_ALREADY_EXISTS, {
              cause: safeError,
            });
          }
        }
      }
      return createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error });
    }).map((savedBadge) => ORMShopBadgeAssignmentMapper.toDomain(savedBadge));
  }

  // ======================== ADMIN OPERATIONS ========================

  @WithPosition()
  findAll(
    filters: AdminShopFilters,
    pagination: PaginationParams,
  ): ResultAsync<PaginatedResult<Shop>, DomainError> {
    const repo = this.getShopRepository();
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    // Build where conditions
    const where: Record<string, unknown> = {};
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.isAdminSuspended !== undefined) {
      where.isAdminSuspended = filters.isAdminSuspended;
    }

    // Search by name or slug
    const searchConditions = filters.search
      ? [
          { ...where, name: ILike(`%${filters.search}%`) },
          { ...where, slug: ILike(`%${filters.search}%`) },
        ]
      : where;

    return ResultAsync.fromPromise(
      Promise.all([
        repo.find({
          where: searchConditions,
          relations: ['badgeAssignments'],
          order: { createdAt: 'DESC' },
          skip,
          take: limit,
        }),
        repo.count({ where: searchConditions }),
      ]),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map(([ormShops, total]) => {
      const shops = ormShops.map((ormShop) => ORMShopMapper.toDomain(ormShop));
      return createPaginatedResult(shops, total, page, limit);
    });
  }

  @WithPosition()
  updateAdminSuspension(
    id: string,
    isAdminSuspended: boolean,
    reason: string | null,
    adminId: string,
  ): ResultAsync<Shop, DomainError> {
    const repo = this.getShopRepository();
    const now = new Date();

    return ResultAsync.fromPromise(
      repo.update(id, {
        isAdminSuspended,
        statusReason: reason,
        statusChangedAt: now,
        statusChangedBy: adminId,
        updatedAt: now,
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).andThen((updateResult) => {
      if (updateResult.affected === 0) {
        return errAsync(
          createDomainError(SHOP_ERRORS.SHOP_NOT_FOUND, {
            cause: 'Shop not found for suspension update',
          }),
        );
      }
      return this.findById(id).andThen((result) => {
        if (!result) {
          return errAsync(
            createDomainError(SHARED_ERRORS.DB_ERROR, {
              cause: 'Failed to fetch updated shop',
            }),
          );
        }
        return okAsync(result);
      });
    });
  }

  @WithPosition()
  banShop(
    id: string,
    reason: string,
    adminId: string,
  ): ResultAsync<Shop, DomainError> {
    const repo = this.getShopRepository();
    const now = new Date();

    return ResultAsync.fromPromise(
      repo.update(id, {
        status: ShopStatus.BANNED,
        statusReason: reason,
        statusChangedAt: now,
        statusChangedBy: adminId,
        updatedAt: now,
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).andThen((updateResult) => {
      if (updateResult.affected === 0) {
        return errAsync(
          createDomainError(SHOP_ERRORS.SHOP_NOT_FOUND, {
            cause: 'Shop not found for ban',
          }),
        );
      }
      return this.findById(id).andThen((result) => {
        if (!result) {
          return errAsync(
            createDomainError(SHARED_ERRORS.DB_ERROR, {
              cause: 'Failed to fetch banned shop',
            }),
          );
        }
        return okAsync(result);
      });
    });
  }

  @WithPosition()
  updateRating(
    shopId: string,
    averageRating: number,
    totalRatings: number,
  ): ResultAsync<void, DomainError> {
    const repo = this.getShopRepository();
    return ResultAsync.fromPromise(
      repo.update(shopId, {
        averageRating,
        totalRatings,
        updatedAt: new Date(),
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map(() => undefined);
  }

  // ======================== HELPERS ========================

  private getEntityManager() {
    if (!this.als) return null;
    const store = this.als.getStore();
    if (!store || !store.ctx) return null;
    return store.ctx;
  }

  private getShopRepository() {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return em.getRepository(ORMShop);
  }

  private getBadgeRepository() {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return em.getRepository(ORMShopBadgeAssignment);
  }
}

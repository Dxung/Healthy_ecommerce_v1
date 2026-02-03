import { Injectable } from '@nestjs/common';
import { DataSource, LessThanOrEqual, IsNull, Or } from 'typeorm';
import { ResultAsync } from 'neverthrow';
import { AsyncLocalStorage } from 'async_hooks';
import {
  IEscrowRepository,
  EscrowListFilters,
  PaginatedEscrowResult,
} from 'src/modules/payment/repository/escrow.repository.interface';
import { EscrowHold } from 'src/modules/payment/models/escrow-hold.model';
import { PendingRelease } from 'src/modules/payment/models/pending-release.model';
import { ORMEscrowHold } from '../../entities/payment/orm.escrow-hold.entity';
import { ORMPendingRelease } from '../../entities/payment/orm.pending-release.entity';
import { ORMOrder } from '../../entities/order/orm.order.entity';
import { ORMShop } from '../../entities/shop/orm.shop.entity';
import { ORMEscrowHoldMapper } from '../../mappers/escrow-hold.mapper.orm';
import { ORMPendingReleaseMapper } from '../../mappers/pending-release.mapper.orm';
import { EscrowStatus } from '../../entities/payment/enums/escrow-status.enum';
import { PendingReleaseStatus } from '../../entities/payment/enums/pending-release-status.enum';
import { OrderStatus } from '../../entities/order/enums/order-status.enum';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { SHARED_ERRORS } from 'src/shared/errors/shared.errors';
import { ITypeORMAlsStore } from 'src/shared/als/interfaces/als-store.interface';

@Injectable()
export class OrmEscrowRepository implements IEscrowRepository {
  constructor(
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
    private readonly dataSource: DataSource,
  ) {}

  @WithPosition()
  createHold(escrowHold: EscrowHold): ResultAsync<EscrowHold, DomainError> {
    const repo = this.getEscrowRepository();
    const ormEscrow = ORMEscrowHoldMapper.toOrm(escrowHold);

    return ResultAsync.fromPromise(repo.save(ormEscrow), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((saved) => ORMEscrowHoldMapper.toDomain(saved));
  }

  @WithPosition()
  findById(id: string): ResultAsync<EscrowHold | null, DomainError> {
    const repo = this.getEscrowRepository();

    return ResultAsync.fromPromise(repo.findOne({ where: { id } }), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormEscrow) =>
      ormEscrow ? ORMEscrowHoldMapper.toDomain(ormEscrow) : null,
    );
  }

  @WithPosition()
  findByOrderId(orderId: string): ResultAsync<EscrowHold[], DomainError> {
    const repo = this.getEscrowRepository();

    return ResultAsync.fromPromise(
      repo.find({ where: { orderId }, order: { createdAt: 'DESC' } }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormEscrows) => ormEscrows.map(ORMEscrowHoldMapper.toDomain));
  }

  @WithPosition()
  updateHold(escrowHold: EscrowHold): ResultAsync<EscrowHold, DomainError> {
    const repo = this.getEscrowRepository();
    const ormEscrow = ORMEscrowHoldMapper.toOrm(escrowHold);

    return ResultAsync.fromPromise(repo.save(ormEscrow), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((saved) => ORMEscrowHoldMapper.toDomain(saved));
  }

  @WithPosition()
  createPendingRelease(
    pendingRelease: PendingRelease,
  ): ResultAsync<PendingRelease, DomainError> {
    const repo = this.getPendingReleaseRepository();
    const ormRelease = ORMPendingReleaseMapper.toOrm(pendingRelease);

    return ResultAsync.fromPromise(repo.save(ormRelease), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((saved) => ORMPendingReleaseMapper.toDomain(saved));
  }

  @WithPosition()
  findPendingReleaseById(
    id: string,
  ): ResultAsync<PendingRelease | null, DomainError> {
    const repo = this.getPendingReleaseRepository();

    return ResultAsync.fromPromise(repo.findOne({ where: { id } }), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormRelease) =>
      ormRelease ? ORMPendingReleaseMapper.toDomain(ormRelease) : null,
    );
  }

  @WithPosition()
  findPendingReleasesForProcessing(): ResultAsync<
    PendingRelease[],
    DomainError
  > {
    const repo = this.getPendingReleaseRepository();
    const now = new Date();

    return ResultAsync.fromPromise(
      repo
        .createQueryBuilder('pr')
        .where('pr.status = :status', { status: PendingReleaseStatus.PENDING })
        .andWhere('pr.attempts < pr.max_attempts')
        .andWhere('(pr.next_retry_at IS NULL OR pr.next_retry_at <= :now)', {
          now,
        })
        .orderBy('pr.created_at', 'ASC')
        .limit(100)
        .getMany(),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormReleases) => ormReleases.map(ORMPendingReleaseMapper.toDomain));
  }

  @WithPosition()
  updatePendingRelease(
    pendingRelease: PendingRelease,
  ): ResultAsync<PendingRelease, DomainError> {
    const repo = this.getPendingReleaseRepository();
    const ormRelease = ORMPendingReleaseMapper.toOrm(pendingRelease);

    return ResultAsync.fromPromise(repo.save(ormRelease), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((saved) => ORMPendingReleaseMapper.toDomain(saved));
  }

  /**
   * Find holding escrows for completed orders that have been completed for at least 24 hours.
   * This is used by the cronjob as a backup mechanism - primary escrow release happens
   * immediately when buyer confirms delivery.
   * The 24h delay prevents conflicts between immediate release and cronjob.
   */
  @WithPosition()
  findHoldingEscrowsForCompletedOrders(): ResultAsync<
    Array<{ escrowHold: EscrowHold; shopId: string }>,
    DomainError
  > {
    const repo = this.getEscrowRepository();
    // Only process orders that have been completed for at least 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    return ResultAsync.fromPromise(
      repo
        .createQueryBuilder('escrow')
        .innerJoin(ORMOrder, 'order', 'escrow.order_id = order.id')
        .where('escrow.status = :status', { status: EscrowStatus.HOLDING })
        .andWhere('order.status = :orderStatus', {
          orderStatus: OrderStatus.COMPLETED,
        })
        .andWhere('order.completed_at <= :completedBefore', {
          completedBefore: twentyFourHoursAgo,
        })
        .getMany(),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormEscrows) =>
      ormEscrows.map((orm) => ({
        escrowHold: ORMEscrowHoldMapper.toDomain(orm),
        shopId: orm.shopId,
      })),
    );
  }

  @WithPosition()
  findAllForAdmin(
    filters: EscrowListFilters,
    page: number,
    limit: number,
  ): ResultAsync<PaginatedEscrowResult, DomainError> {
    const repo = this.getEscrowRepository();
    const offset = (page - 1) * limit;

    const queryBuilder = repo
      .createQueryBuilder('escrow')
      .innerJoin(ORMOrder, 'order', 'escrow.order_id = order.id')
      .innerJoin(ORMShop, 'shop', 'escrow.shop_id = shop.id')
      .select('escrow.id', 'escrowId')
      .addSelect('escrow.order_id', 'escrowOrderId')
      .addSelect('escrow.shop_id', 'escrowShopId')
      .addSelect('escrow.amount', 'escrowAmount')
      .addSelect('escrow.order_subtotal', 'escrowOrderSubtotal')
      .addSelect('escrow.shipping_fee', 'escrowShippingFee')
      .addSelect('escrow.coin_used', 'escrowCoinUsed')
      .addSelect('escrow.platform_fee_percent', 'escrowPlatformFeePercent')
      .addSelect('escrow.status', 'escrowStatus')
      .addSelect('escrow.released_at', 'escrowReleasedAt')
      .addSelect('escrow.created_at', 'escrowCreatedAt')
      .addSelect('escrow.updated_at', 'escrowUpdatedAt')
      .addSelect('order.order_code', 'orderCode')
      .addSelect('order.platform_ship_discount', 'platformShipDiscount')
      .addSelect('shop.name', 'shopName');

    if (filters.status) {
      queryBuilder.andWhere('escrow.status = :status', {
        status: filters.status,
      });
    }

    if (filters.fromDate) {
      queryBuilder.andWhere('escrow.created_at >= :fromDate', {
        fromDate: new Date(filters.fromDate),
      });
    }

    if (filters.toDate) {
      const toDateEnd = new Date(filters.toDate);
      toDateEnd.setHours(23, 59, 59, 999);
      queryBuilder.andWhere('escrow.created_at <= :toDate', {
        toDate: toDateEnd,
      });
    }

    queryBuilder.orderBy('escrow.created_at', 'DESC');

    return ResultAsync.fromPromise(
      Promise.all([
        queryBuilder
          .offset(offset)
          .limit(limit)
          .getRawMany(),
        queryBuilder.getCount(),
      ]),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map(([rawResults, total]) => {
      const items = rawResults.map((raw) => {
        const escrow = ORMEscrowHoldMapper.toDomain({
          id: raw.escrowId,
          orderId: raw.escrowOrderId,
          shopId: raw.escrowShopId,
          amount: parseFloat(raw.escrowAmount || 0),
          orderSubtotal: parseFloat(raw.escrowOrderSubtotal || 0),
          shippingFee: parseFloat(raw.escrowShippingFee || 0),
          coinUsed: parseFloat(raw.escrowCoinUsed || 0),
          platformFeePercent: parseFloat(raw.escrowPlatformFeePercent || 0),
          status: raw.escrowStatus,
          releasedAt: raw.escrowReleasedAt,
          createdAt: raw.escrowCreatedAt,
          updatedAt: raw.escrowUpdatedAt,
        } as ORMEscrowHold);

        return {
          escrow,
          orderCode: raw.orderCode,
          shopName: raw.shopName,
          platformShipDiscount: parseFloat(raw.platformShipDiscount || 0),
        };
      });

      return {
        items,
        total,
        page,
        limit,
      };
    });
  }

  private getEntityManager() {
    const store = this.als.getStore();
    if (!store || !store.ctx) return null;
    return store.ctx;
  }

  private getEscrowRepository() {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return em.getRepository(ORMEscrowHold);
  }

  private getPendingReleaseRepository() {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return em.getRepository(ORMPendingRelease);
  }
}

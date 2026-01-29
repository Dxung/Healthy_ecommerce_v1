import { Injectable } from '@nestjs/common';
import { DataSource, LessThanOrEqual, IsNull, Or } from 'typeorm';
import { ResultAsync } from 'neverthrow';
import { AsyncLocalStorage } from 'async_hooks';
import { IEscrowRepository } from 'src/modules/payment/repository/escrow.repository.interface';
import { EscrowHold } from 'src/modules/payment/models/escrow-hold.model';
import { PendingRelease } from 'src/modules/payment/models/pending-release.model';
import { ORMEscrowHold } from '../../entities/payment/orm.escrow-hold.entity';
import { ORMPendingRelease } from '../../entities/payment/orm.pending-release.entity';
import { ORMOrder } from '../../entities/order/orm.order.entity';
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

    return ResultAsync.fromPromise(
      repo.findOne({ where: { id } }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
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

    return ResultAsync.fromPromise(
      repo.findOne({ where: { id } }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormRelease) =>
      ormRelease ? ORMPendingReleaseMapper.toDomain(ormRelease) : null,
    );
  }

  @WithPosition()
  findPendingReleasesForProcessing(): ResultAsync<PendingRelease[], DomainError> {
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

  @WithPosition()
  findHoldingEscrowsForCompletedOrders(): ResultAsync<
    Array<{ escrowHold: EscrowHold; shopId: string }>,
    DomainError
  > {
    const repo = this.getEscrowRepository();

    return ResultAsync.fromPromise(
      repo
        .createQueryBuilder('escrow')
        .innerJoin(ORMOrder, 'order', 'escrow.order_id = order.id')
        .where('escrow.status = :status', { status: EscrowStatus.HOLDING })
        .andWhere('order.status = :orderStatus', { orderStatus: OrderStatus.COMPLETED })
        .getMany(),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormEscrows) =>
      ormEscrows.map((orm) => ({
        escrowHold: ORMEscrowHoldMapper.toDomain(orm),
        shopId: orm.shopId,
      })),
    );
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

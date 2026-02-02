import { Injectable } from '@nestjs/common';
import {
  IBadgeApplicationRepository,
  BadgeApplicationFilters,
} from 'src/modules/shop/repository/badge-application.repository.interface';
import { ORMBadgeApplicationMapper } from '../../mappers/badge-application.mapper.orm';
import { BadgeApplication } from 'src/modules/shop/models/badge-application.model';
import { AsyncLocalStorage } from 'async_hooks';
import { ITypeORMAlsStore } from 'src/shared/als/interfaces/als-store.interface';
import { DataSource } from 'typeorm';
import {
  ORMBadgeApplication,
  ORMBadgeApplicationDocument,
} from '../../entities/shop';
import { BadgeApplicationStatus } from '../../entities/shop/enums/badge-application-status.enum';
import { BadgeApplicationType } from '../../entities/shop/enums/badge-application-type.enum';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { SHARED_ERRORS } from 'src/shared/errors/shared.errors';
import { ResultAsync, okAsync } from 'neverthrow';
import {
  PaginatedResult,
  PaginationParams,
  createPaginatedResult,
} from 'src/shared/types/pagination.type';

@Injectable()
export class OrmBadgeApplicationRepository
  implements IBadgeApplicationRepository
{
  constructor(
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
    private readonly dataSource: DataSource,
  ) {}

  @WithPosition()
  create(
    application: BadgeApplication,
  ): ResultAsync<BadgeApplication, DomainError> {
    const repo = this.getApplicationRepository();
    const docRepo = this.getDocumentRepository();
    const ormApplication = ORMBadgeApplicationMapper.toOrm(application);

    return ResultAsync.fromPromise(
      (async () => {
        // Save application first
        const savedApp = await repo.save(ormApplication);

        // Save documents
        if (application.documents.length > 0) {
          const ormDocs = application.documents.map((doc) =>
            ORMBadgeApplicationMapper.documentToOrm(doc),
          );
          await docRepo.save(ormDocs);
        }

        // Fetch with relations
        return repo.findOne({
          where: { id: savedApp.id },
          relations: ['documents'],
        });
      })(),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((saved) => {
      if (!saved) {
        throw new Error('Failed to fetch created badge application');
      }
      return ORMBadgeApplicationMapper.toDomain(saved);
    });
  }

  @WithPosition()
  findById(id: string): ResultAsync<BadgeApplication | null, DomainError> {
    const repo = this.getApplicationRepository();
    return ResultAsync.fromPromise(
      repo.findOne({
        where: { id },
        relations: ['documents'],
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormApp) => {
      if (!ormApp) return null;
      return ORMBadgeApplicationMapper.toDomain(ormApp);
    });
  }

  @WithPosition()
  findByShopId(shopId: string): ResultAsync<BadgeApplication[], DomainError> {
    const repo = this.getApplicationRepository();
    return ResultAsync.fromPromise(
      repo.find({
        where: { shopId },
        relations: ['documents'],
        order: { createdAt: 'DESC' },
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormApps) => ORMBadgeApplicationMapper.toDomainList(ormApps));
  }

  @WithPosition()
  findPendingVerifiedByShop(
    shopId: string,
  ): ResultAsync<BadgeApplication | null, DomainError> {
    const repo = this.getApplicationRepository();
    return ResultAsync.fromPromise(
      repo.findOne({
        where: {
          shopId,
          applicationType: BadgeApplicationType.VERIFIED,
          status: BadgeApplicationStatus.PENDING,
        },
        relations: ['documents'],
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormApp) => {
      if (!ormApp) return null;
      return ORMBadgeApplicationMapper.toDomain(ormApp);
    });
  }

  @WithPosition()
  findPendingOfficialByShopAndBrand(
    shopId: string,
    brandId: string,
  ): ResultAsync<BadgeApplication | null, DomainError> {
    const repo = this.getApplicationRepository();
    return ResultAsync.fromPromise(
      repo.findOne({
        where: {
          shopId,
          brandId,
          applicationType: BadgeApplicationType.OFFICIAL,
          status: BadgeApplicationStatus.PENDING,
        },
        relations: ['documents'],
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormApp) => {
      if (!ormApp) return null;
      return ORMBadgeApplicationMapper.toDomain(ormApp);
    });
  }

  @WithPosition()
  update(
    application: BadgeApplication,
  ): ResultAsync<BadgeApplication, DomainError> {
    const repo = this.getApplicationRepository();

    return ResultAsync.fromPromise(
      repo.update(application.id, {
        status: application.status,
        rejectionReason: application.rejectionReason,
        reviewedBy: application.reviewedBy,
        reviewedAt: application.reviewedAt,
        updatedAt: application.updatedAt,
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).andThen(() => {
      return this.findById(application.id).map((result) => {
        if (!result) {
          throw new Error('Failed to fetch updated badge application');
        }
        return result;
      });
    });
  }

  @WithPosition()
  findAll(
    filters: BadgeApplicationFilters,
    pagination: PaginationParams,
  ): ResultAsync<PaginatedResult<BadgeApplication>, DomainError> {
    const repo = this.getApplicationRepository();
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    // Build where conditions
    const where: Record<string, unknown> = {};
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.applicationType) {
      where.applicationType = filters.applicationType;
    }
    if (filters.shopId) {
      where.shopId = filters.shopId;
    }

    return ResultAsync.fromPromise(
      Promise.all([
        repo.find({
          where,
          relations: ['documents', 'shop', 'brand'],
          order: { createdAt: 'DESC' },
          skip,
          take: limit,
        }),
        repo.count({ where }),
      ]),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map(([ormApps, total]) => {
      const applications = ORMBadgeApplicationMapper.toDomainList(ormApps);
      return createPaginatedResult(applications, total, page, limit);
    });
  }

  // ======================== HELPERS ========================

  private getEntityManager() {
    if (!this.als) return null;
    const store = this.als.getStore();
    if (!store || !store.ctx) return null;
    return store.ctx;
  }

  private getApplicationRepository() {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return em.getRepository(ORMBadgeApplication);
  }

  private getDocumentRepository() {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return em.getRepository(ORMBadgeApplicationDocument);
  }
}

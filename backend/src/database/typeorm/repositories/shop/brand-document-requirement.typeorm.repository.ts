import { Injectable } from '@nestjs/common';
import { IBrandDocumentRequirementRepository } from 'src/modules/shop/repository/brand-document-requirement.repository.interface';
import { ORMBrandDocumentRequirementMapper } from '../../mappers/brand-document-requirement.mapper.orm';
import { BrandDocumentRequirement } from 'src/modules/shop/models/brand-document-requirement.model';
import { AsyncLocalStorage } from 'async_hooks';
import { ITypeORMAlsStore } from 'src/shared/als/interfaces/als-store.interface';
import { DataSource } from 'typeorm';
import { ORMBrandDocumentRequirement } from '../../entities/shop';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { SHARED_ERRORS } from 'src/shared/errors/shared.errors';
import { BADGE_APPLICATION_ERRORS } from 'src/modules/shop/errors/badge-application.errors';
import { ResultAsync, errAsync, okAsync } from 'neverthrow';
import { isQueryFailedPostgresError } from '../../guards/type-guard.database';
import { PG_UNIQUE_VIOLATION } from 'src/database/constant/postgresql-error.constant';
import { sanitizePostgresError } from '../../guards/sanitize-postgres-error.util';

@Injectable()
export class OrmBrandDocumentRequirementRepository implements IBrandDocumentRequirementRepository {
  constructor(
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
    private readonly dataSource: DataSource,
  ) {}

  @WithPosition()
  create(requirement: BrandDocumentRequirement): ResultAsync<BrandDocumentRequirement, DomainError> {
    const repo = this.getRepository();
    const ormEntity = ORMBrandDocumentRequirementMapper.toOrm(requirement);

    return ResultAsync.fromPromise(repo.save(ormEntity), (error) => {
      if (isQueryFailedPostgresError(error)) {
        const safeError = sanitizePostgresError(error.driverError);

        if (error.driverError.code === PG_UNIQUE_VIOLATION) {
          if (error.driverError.constraint === 'uq_brand_document_requirement') {
            return createDomainError(BADGE_APPLICATION_ERRORS.REQUIREMENT_ALREADY_EXISTS, {
              cause: safeError,
            });
          }
        }
      }
      return createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error });
    }).map((saved) => ORMBrandDocumentRequirementMapper.toDomain(saved));
  }

  @WithPosition()
  findById(id: string): ResultAsync<BrandDocumentRequirement | null, DomainError> {
    const repo = this.getRepository();
    return ResultAsync.fromPromise(
      repo.findOne({ where: { id } }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormEntity) => {
      if (!ormEntity) return null;
      return ORMBrandDocumentRequirementMapper.toDomain(ormEntity);
    });
  }

  @WithPosition()
  findActiveByBrand(brandId: string): ResultAsync<BrandDocumentRequirement[], DomainError> {
    const repo = this.getRepository();
    return ResultAsync.fromPromise(
      repo.find({
        where: { brandId, isActive: true },
        relations: ['documentType'],
        order: { createdAt: 'ASC' },
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormEntities) => ORMBrandDocumentRequirementMapper.toDomainList(ormEntities));
  }

  @WithPosition()
  findAllByBrand(brandId: string): ResultAsync<BrandDocumentRequirement[], DomainError> {
    const repo = this.getRepository();
    return ResultAsync.fromPromise(
      repo.find({
        where: { brandId },
        relations: ['documentType'],
        order: { createdAt: 'ASC' },
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormEntities) => ORMBrandDocumentRequirementMapper.toDomainList(ormEntities));
  }

  @WithPosition()
  existsByBrandAndDocumentType(
    brandId: string,
    documentTypeId: string,
  ): ResultAsync<boolean, DomainError> {
    const repo = this.getRepository();
    return ResultAsync.fromPromise(
      repo.exists({ where: { brandId, documentTypeId } }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    );
  }

  @WithPosition()
  update(requirement: BrandDocumentRequirement): ResultAsync<BrandDocumentRequirement, DomainError> {
    const repo = this.getRepository();

    return ResultAsync.fromPromise(
      repo.update(requirement.id, {
        isActive: requirement.isActive,
        updatedAt: requirement.updatedAt,
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).andThen(() => {
      return this.findById(requirement.id).andThen((result) => {
        if (!result) {
          return errAsync(
            createDomainError(BADGE_APPLICATION_ERRORS.REQUIREMENT_NOT_FOUND, {
              cause: 'Requirement not found after update',
            }),
          );
        }
        return okAsync(result);
      });
    });
  }

  @WithPosition()
  delete(id: string): ResultAsync<void, DomainError> {
    const repo = this.getRepository();
    return ResultAsync.fromPromise(
      repo.delete(id),
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

  private getRepository() {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return em.getRepository(ORMBrandDocumentRequirement);
  }
}

import { Injectable } from '@nestjs/common';
import { IBadgeRequirementRepository } from 'src/modules/shop/repository/badge-requirement.repository.interface';
import { ORMBadgeRequirementMapper } from '../../mappers/badge-requirement.mapper.orm';
import { BadgeRequirement } from 'src/modules/shop/models/badge-requirement.model';
import { ShopBadgeCode } from '../../entities/shop/enums/shop-badge-code.enum';
import { AsyncLocalStorage } from 'async_hooks';
import { ITypeORMAlsStore } from 'src/shared/als/interfaces/als-store.interface';
import { DataSource } from 'typeorm';
import { ORMBadgeRequirement } from '../../entities/shop';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { SHARED_ERRORS } from 'src/shared/errors/shared.errors';
import { SHOP_ERRORS } from 'src/modules/shop/errors/shop.errors';
import { ResultAsync, errAsync, okAsync } from 'neverthrow';

@Injectable()
export class OrmBadgeRequirementRepository
  implements IBadgeRequirementRepository
{
  constructor(
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
    private readonly dataSource: DataSource,
  ) {}

  @WithPosition()
  create(
    requirement: BadgeRequirement,
  ): ResultAsync<BadgeRequirement, DomainError> {
    const repo = this.getRepository();
    const ormReq = ORMBadgeRequirementMapper.toOrm(requirement);

    return ResultAsync.fromPromise(repo.save(ormReq), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).andThen(() => {
      // Fetch with document type relation
      return this.findById(requirement.id, true).andThen((result) => {
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

  @WithPosition()
  findByBadgeCode(
    badgeCode: ShopBadgeCode,
    includeDocumentType = false,
  ): ResultAsync<BadgeRequirement[], DomainError> {
    const repo = this.getRepository();
    const relations = includeDocumentType ? ['documentType'] : [];

    return ResultAsync.fromPromise(
      repo.find({
        where: { badgeCode },
        order: { requirementType: 'ASC', createdAt: 'ASC' },
        relations,
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormReqs) => ORMBadgeRequirementMapper.toDomainList(ormReqs));
  }

  @WithPosition()
  findActiveByBadgeCode(
    badgeCode: ShopBadgeCode,
    includeDocumentType = false,
  ): ResultAsync<BadgeRequirement[], DomainError> {
    const repo = this.getRepository();
    const relations = includeDocumentType ? ['documentType'] : [];

    return ResultAsync.fromPromise(
      repo.find({
        where: { badgeCode, isActive: true },
        order: { requirementType: 'ASC', createdAt: 'ASC' },
        relations,
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormReqs) => ORMBadgeRequirementMapper.toDomainList(ormReqs));
  }

  @WithPosition()
  findById(
    id: string,
    includeDocumentType = false,
  ): ResultAsync<BadgeRequirement | null, DomainError> {
    const repo = this.getRepository();
    const relations = includeDocumentType ? ['documentType'] : [];

    return ResultAsync.fromPromise(
      repo.findOne({
        where: { id },
        relations,
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormReq) => {
      if (!ormReq) return null;
      return ORMBadgeRequirementMapper.toDomain(ormReq);
    });
  }

  @WithPosition()
  update(
    requirement: BadgeRequirement,
  ): ResultAsync<BadgeRequirement, DomainError> {
    const repo = this.getRepository();

    return ResultAsync.fromPromise(
      repo.update(requirement.id, {
        isActive: requirement.isActive,
        updatedAt: requirement.updatedAt,
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).andThen((updateResult) => {
      if (updateResult.affected === 0) {
        return errAsync(
          createDomainError(SHOP_ERRORS.REQUIREMENT_NOT_FOUND, {
            cause: SHOP_ERRORS.REQUIREMENT_NOT_FOUND.message,
          }),
        );
      }
      return this.findById(requirement.id, true).andThen((result) => {
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

  @WithPosition()
  delete(id: string): ResultAsync<void, DomainError> {
    const repo = this.getRepository();

    return ResultAsync.fromPromise(repo.delete(id), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).andThen((deleteResult) => {
      if (deleteResult.affected === 0) {
        return errAsync(
          createDomainError(SHOP_ERRORS.REQUIREMENT_NOT_FOUND, {
            cause: SHOP_ERRORS.REQUIREMENT_NOT_FOUND.message,
          }),
        );
      }
      return okAsync(undefined);
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
    return em.getRepository(ORMBadgeRequirement);
  }
}

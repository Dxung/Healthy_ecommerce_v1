import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { DataSource } from 'typeorm';
import { ResultAsync } from 'neverthrow';
import { v7 as uuidv7 } from 'uuid';
import { ITypeORMAlsStore } from 'src/shared/als/interfaces/als-store.interface';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { SHARED_ERRORS } from 'src/shared/errors/shared.errors';
import {
  IAllergenExclusionRepository,
  AllergenExclusionInfo,
} from 'src/modules/meal-plan/repository/allergen-exclusion.repository.interface';
import { ORMUserAllergenExclusion } from '../../entities/meal-plan';
import { ORMAllergenTag } from '../../entities/product';

@Injectable()
export class OrmAllergenExclusionRepository implements IAllergenExclusionRepository {
  constructor(
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
    private readonly dataSource: DataSource,
  ) {}

  @WithPosition()
  getByUserId(userId: string): ResultAsync<AllergenExclusionInfo[], DomainError> {
    const em = this.getEntityManager() ?? this.dataSource.manager;

    return ResultAsync.fromPromise(
      em
        .createQueryBuilder(ORMUserAllergenExclusion, 'excl')
        .innerJoin(ORMAllergenTag, 'tag', 'tag.id = excl.allergenTagId')
        .select([
          'excl.id AS "id"',
          'excl.allergenTagId AS "allergenTagId"',
          'tag.name AS "allergenTagName"',
          'tag.slug AS "allergenTagSlug"',
        ])
        .where('excl.userId = :userId', { userId })
        .orderBy('tag.name', 'ASC')
        .getRawMany(),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    );
  }

  @WithPosition()
  setExclusions(
    userId: string,
    allergenTagIds: string[],
  ): ResultAsync<void, DomainError> {
    const em = this.getEntityManager() ?? this.dataSource.manager;

    return ResultAsync.fromPromise(
      em.transaction(async (txManager) => {
        const repo = txManager.getRepository(ORMUserAllergenExclusion);

        // Delete existing exclusions
        await repo.delete({ userId });

        // Insert new exclusions
        if (allergenTagIds.length > 0) {
          const entities = allergenTagIds.map((allergenTagId) => {
            const excl = new ORMUserAllergenExclusion();
            excl.id = uuidv7();
            excl.userId = userId;
            excl.allergenTagId = allergenTagId;
            return excl;
          });
          await repo.insert(entities);
        }
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    );
  }

  @WithPosition()
  addExclusion(
    userId: string,
    allergenTagId: string,
  ): ResultAsync<void, DomainError> {
    const repo = this.getRepository();
    const excl = new ORMUserAllergenExclusion();
    excl.id = uuidv7();
    excl.userId = userId;
    excl.allergenTagId = allergenTagId;

    return ResultAsync.fromPromise(
      repo.upsert(excl, ['userId', 'allergenTagId']),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map(() => undefined);
  }

  @WithPosition()
  removeExclusion(
    userId: string,
    allergenTagId: string,
  ): ResultAsync<void, DomainError> {
    const repo = this.getRepository();
    return ResultAsync.fromPromise(
      repo.delete({ userId, allergenTagId }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map(() => undefined);
  }

  private getEntityManager() {
    if (!this.als) return null;
    const store = this.als.getStore();
    if (!store || !store.ctx) return null;
    return store.ctx;
  }

  private getRepository() {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return em.getRepository(ORMUserAllergenExclusion);
  }
}

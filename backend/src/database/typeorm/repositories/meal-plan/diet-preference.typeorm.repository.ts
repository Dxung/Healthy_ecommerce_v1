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
  IDietPreferenceRepository,
  DietPreferenceInfo,
} from 'src/modules/meal-plan/repository/diet-preference.repository.interface';
import { ORMUserDietPreference } from '../../entities/meal-plan';
import { ORMDietTag } from '../../entities/product';

@Injectable()
export class OrmDietPreferenceRepository implements IDietPreferenceRepository {
  constructor(
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
    private readonly dataSource: DataSource,
  ) {}

  @WithPosition()
  getByUserId(userId: string): ResultAsync<DietPreferenceInfo[], DomainError> {
    const em = this.getEntityManager() ?? this.dataSource.manager;

    return ResultAsync.fromPromise(
      em
        .createQueryBuilder(ORMUserDietPreference, 'pref')
        .innerJoin(ORMDietTag, 'tag', 'tag.id = pref.dietTagId')
        .select([
          'pref.id AS "id"',
          'pref.dietTagId AS "dietTagId"',
          'tag.name AS "dietTagName"',
          'tag.slug AS "dietTagSlug"',
        ])
        .where('pref.userId = :userId', { userId })
        .orderBy('tag.name', 'ASC')
        .getRawMany(),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    );
  }

  @WithPosition()
  setPreferences(
    userId: string,
    dietTagIds: string[],
  ): ResultAsync<void, DomainError> {
    const em = this.getEntityManager() ?? this.dataSource.manager;

    return ResultAsync.fromPromise(
      em.transaction(async (txManager) => {
        const repo = txManager.getRepository(ORMUserDietPreference);

        // Delete existing preferences
        await repo.delete({ userId });

        // Insert new preferences
        if (dietTagIds.length > 0) {
          const entities = dietTagIds.map((dietTagId) => {
            const pref = new ORMUserDietPreference();
            pref.id = uuidv7();
            pref.userId = userId;
            pref.dietTagId = dietTagId;
            return pref;
          });
          await repo.insert(entities);
        }
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    );
  }

  @WithPosition()
  addPreference(
    userId: string,
    dietTagId: string,
  ): ResultAsync<void, DomainError> {
    const repo = this.getRepository();
    const pref = new ORMUserDietPreference();
    pref.id = uuidv7();
    pref.userId = userId;
    pref.dietTagId = dietTagId;

    return ResultAsync.fromPromise(
      repo.upsert(pref, ['userId', 'dietTagId']),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map(() => undefined);
  }

  @WithPosition()
  removePreference(
    userId: string,
    dietTagId: string,
  ): ResultAsync<void, DomainError> {
    const repo = this.getRepository();
    return ResultAsync.fromPromise(
      repo.delete({ userId, dietTagId }),
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
    return em.getRepository(ORMUserDietPreference);
  }
}

import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { DataSource, ILike } from 'typeorm';
import { ResultAsync } from 'neverthrow';
import { ITypeORMAlsStore } from 'src/shared/als/interfaces/als-store.interface';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { SHARED_ERRORS } from 'src/shared/errors/shared.errors';
import {
  IDietTagRepository,
  DietTagFilter,
} from 'src/modules/product/repository/diet-tag.repository.interface';
import { DietTag } from 'src/modules/product/models/diet-tag.model';
import { ORMDietTag } from '../../entities/product';
import { ORMDietTagMapper } from '../../mappers/diet-tag.mapper.orm';

@Injectable()
export class OrmDietTagRepository implements IDietTagRepository {
  constructor(
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
    private readonly dataSource: DataSource,
  ) {}

  @WithPosition()
  findById(id: string): ResultAsync<DietTag | null, DomainError> {
    const repo = this.getDietTagRepository();
    return ResultAsync.fromPromise(repo.findOne({ where: { id } }), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orm) => (orm ? ORMDietTagMapper.toDomain(orm) : null));
  }

  @WithPosition()
  findBySlug(slug: string): ResultAsync<DietTag | null, DomainError> {
    const repo = this.getDietTagRepository();
    return ResultAsync.fromPromise(repo.findOne({ where: { slug } }), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orm) => (orm ? ORMDietTagMapper.toDomain(orm) : null));
  }

  @WithPosition()
  findAll(filter?: DietTagFilter): ResultAsync<DietTag[], DomainError> {
    const repo = this.getDietTagRepository();
    const where: Record<string, unknown> = {};

    if (filter?.isActive !== undefined) {
      where.isActive = filter.isActive;
    }
    if (filter?.search) {
      where.name = ILike(`%${filter.search}%`);
    }

    return ResultAsync.fromPromise(
      repo.find({
        where,
        order: { name: 'ASC' },
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orms) => ORMDietTagMapper.toDomainList(orms));
  }

  @WithPosition()
  create(dietTag: DietTag): ResultAsync<DietTag, DomainError> {
    const repo = this.getDietTagRepository();
    const orm = ORMDietTagMapper.toOrm(dietTag);
    return ResultAsync.fromPromise(repo.save(orm), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((saved) => ORMDietTagMapper.toDomain(saved));
  }

  @WithPosition()
  update(dietTag: DietTag): ResultAsync<DietTag, DomainError> {
    const repo = this.getDietTagRepository();
    const orm = ORMDietTagMapper.toOrm(dietTag);
    return ResultAsync.fromPromise(repo.save(orm), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((saved) => ORMDietTagMapper.toDomain(saved));
  }

  @WithPosition()
  softDelete(id: string): ResultAsync<void, DomainError> {
    const repo = this.getDietTagRepository();
    return ResultAsync.fromPromise(repo.softDelete(id), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map(() => undefined);
  }

  @WithPosition()
  slugExists(
    slug: string,
    excludeId?: string,
  ): ResultAsync<boolean, DomainError> {
    const repo = this.getDietTagRepository();
    return ResultAsync.fromPromise(
      repo
        .createQueryBuilder('dietTag')
        .where('dietTag.slug = :slug', { slug })
        .andWhere('dietTag.deleted_at IS NULL') // Only check non-deleted diet tags
        .andWhere(excludeId ? 'dietTag.id != :excludeId' : '1=1', { excludeId })
        .getExists(),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    );
  }

  @WithPosition()
  isInUse(dietTagId: string): ResultAsync<boolean, DomainError> {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return ResultAsync.fromPromise(
      em.query(
        `SELECT EXISTS(SELECT 1 FROM product_schema.product_diet_tags WHERE diet_tag_id = $1) as exists`,
        [dietTagId],
      ),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((result: { exists: boolean }[]) => result[0]?.exists ?? false);
  }

  private getEntityManager() {
    if (!this.als) return null;
    const store = this.als.getStore();
    if (!store || !store.ctx) return null;
    return store.ctx;
  }

  private getDietTagRepository() {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return em.getRepository(ORMDietTag);
  }
}

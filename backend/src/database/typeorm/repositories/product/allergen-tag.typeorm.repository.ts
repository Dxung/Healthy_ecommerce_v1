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
  IAllergenTagRepository,
  AllergenTagFilter,
} from 'src/modules/product/repository/allergen-tag.repository.interface';
import { AllergenTag } from 'src/modules/product/models/allergen-tag.model';
import { ORMAllergenTag } from '../../entities/product';
import { ORMAllergenTagMapper } from '../../mappers/allergen-tag.mapper.orm';

@Injectable()
export class OrmAllergenTagRepository implements IAllergenTagRepository {
  constructor(
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
    private readonly dataSource: DataSource,
  ) {}

  @WithPosition()
  findById(id: string): ResultAsync<AllergenTag | null, DomainError> {
    const repo = this.getAllergenTagRepository();
    return ResultAsync.fromPromise(repo.findOne({ where: { id } }), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orm) => (orm ? ORMAllergenTagMapper.toDomain(orm) : null));
  }

  @WithPosition()
  findBySlug(slug: string): ResultAsync<AllergenTag | null, DomainError> {
    const repo = this.getAllergenTagRepository();
    return ResultAsync.fromPromise(repo.findOne({ where: { slug } }), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orm) => (orm ? ORMAllergenTagMapper.toDomain(orm) : null));
  }

  @WithPosition()
  findAll(filter?: AllergenTagFilter): ResultAsync<AllergenTag[], DomainError> {
    const repo = this.getAllergenTagRepository();
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
    ).map((orms) => ORMAllergenTagMapper.toDomainList(orms));
  }

  @WithPosition()
  create(allergenTag: AllergenTag): ResultAsync<AllergenTag, DomainError> {
    const repo = this.getAllergenTagRepository();
    const orm = ORMAllergenTagMapper.toOrm(allergenTag);
    return ResultAsync.fromPromise(repo.save(orm), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((saved) => ORMAllergenTagMapper.toDomain(saved));
  }

  @WithPosition()
  update(allergenTag: AllergenTag): ResultAsync<AllergenTag, DomainError> {
    const repo = this.getAllergenTagRepository();
    const orm = ORMAllergenTagMapper.toOrm(allergenTag);
    return ResultAsync.fromPromise(repo.save(orm), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((saved) => ORMAllergenTagMapper.toDomain(saved));
  }

  @WithPosition()
  softDelete(id: string): ResultAsync<void, DomainError> {
    const repo = this.getAllergenTagRepository();
    return ResultAsync.fromPromise(repo.softDelete(id), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map(() => undefined);
  }

  @WithPosition()
  slugExists(
    slug: string,
    excludeId?: string,
  ): ResultAsync<boolean, DomainError> {
    const repo = this.getAllergenTagRepository();
    return ResultAsync.fromPromise(
      repo
        .createQueryBuilder('allergenTag')
        .where('allergenTag.slug = :slug', { slug })
        .andWhere('allergenTag.deleted_at IS NULL') // Only check non-deleted allergen tags
        .andWhere(excludeId ? 'allergenTag.id != :excludeId' : '1=1', {
          excludeId,
        })
        .getExists(),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    );
  }

  @WithPosition()
  isInUse(allergenTagId: string): ResultAsync<boolean, DomainError> {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return ResultAsync.fromPromise(
      em.query(
        `SELECT EXISTS(SELECT 1 FROM product_schema.product_allergen_tags WHERE allergen_tag_id = $1) as exists`,
        [allergenTagId],
      ),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((result: { exists: boolean }[]) => result[0]?.exists ?? false);
  }

  @WithPosition()
  findByProductId(productId: string): ResultAsync<AllergenTag[], DomainError> {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return ResultAsync.fromPromise(
      em.query(
        `SELECT at.* FROM product_schema.allergen_tags at
         INNER JOIN product_schema.product_allergen_tags pat ON at.id = pat.allergen_tag_id
         WHERE pat.product_id = $1 AND at.deleted_at IS NULL AND at.is_active = true
         ORDER BY at.name ASC`,
        [productId],
      ),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((rows: ORMAllergenTag[]) => ORMAllergenTagMapper.toDomainList(rows));
  }

  @WithPosition()
  setProductAllergenTags(
    productId: string,
    allergenTagIds: string[],
  ): ResultAsync<void, DomainError> {
    const em = this.getEntityManager() ?? this.dataSource.manager;

    // Delete existing tags for this product, then insert new ones
    return ResultAsync.fromPromise(
      em.query(
        `DELETE FROM product_schema.product_allergen_tags WHERE product_id = $1`,
        [productId],
      ),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).andThen(() => {
      if (allergenTagIds.length === 0) {
        return ResultAsync.fromSafePromise(Promise.resolve(undefined));
      }

      // Build VALUES clause for bulk insert
      const values = allergenTagIds
        .map((_, index) => `($1, $${index + 2})`)
        .join(', ');
      const params = [productId, ...allergenTagIds];

      return ResultAsync.fromPromise(
        em.query(
          `INSERT INTO product_schema.product_allergen_tags (product_id, allergen_tag_id) VALUES ${values}`,
          params,
        ),
        (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
      ).map(() => undefined);
    });
  }

  private getEntityManager() {
    if (!this.als) return null;
    const store = this.als.getStore();
    if (!store || !store.ctx) return null;
    return store.ctx;
  }

  private getAllergenTagRepository() {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return em.getRepository(ORMAllergenTag);
  }
}

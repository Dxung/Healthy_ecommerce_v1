import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { DataSource, IsNull } from 'typeorm';
import { ResultAsync } from 'neverthrow';
import { ITypeORMAlsStore } from 'src/shared/als/interfaces/als-store.interface';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { SHARED_ERRORS } from 'src/shared/errors/shared.errors';
import {
  ICategoryRepository,
  CategoryFilter,
} from 'src/modules/product/repository/category.repository.interface';
import { Category } from 'src/modules/product/models/category.model';
import { ORMCategory, ORMProduct } from '../../entities/product';
import { ORMCategoryMapper } from '../../mappers/category.mapper.orm';

@Injectable()
export class OrmCategoryRepository implements ICategoryRepository {
  constructor(
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
    private readonly dataSource: DataSource,
  ) {}

  @WithPosition()
  findById(id: string): ResultAsync<Category | null, DomainError> {
    const repo = this.getCategoryRepository();
    return ResultAsync.fromPromise(repo.findOne({ where: { id } }), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orm) => (orm ? ORMCategoryMapper.toDomain(orm) : null));
  }

  @WithPosition()
  findBySlug(slug: string): ResultAsync<Category | null, DomainError> {
    const repo = this.getCategoryRepository();
    return ResultAsync.fromPromise(repo.findOne({ where: { slug } }), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orm) => (orm ? ORMCategoryMapper.toDomain(orm) : null));
  }

  @WithPosition()
  findAll(filter?: CategoryFilter): ResultAsync<Category[], DomainError> {
    const repo = this.getCategoryRepository();
    const where: Record<string, unknown> = {};

    if (filter?.parentId !== undefined) {
      where.parentId = filter.parentId === null ? IsNull() : filter.parentId;
    }
    if (filter?.isActive !== undefined) {
      where.isActive = filter.isActive;
    }
    if (filter?.level !== undefined) {
      where.level = filter.level;
    }

    return ResultAsync.fromPromise(
      repo.find({
        where,
        order: { sortOrder: 'ASC', name: 'ASC' },
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orms) => ORMCategoryMapper.toDomainList(orms));
  }

  @WithPosition()
  findHierarchy(activeOnly = true): ResultAsync<Category[], DomainError> {
    const repo = this.getCategoryRepository();

    // When activeOnly=false (admin), load all categories with all children
    if (!activeOnly) {
      return ResultAsync.fromPromise(
        repo.find({
          where: { parentId: IsNull() },
          relations: ['children', 'children.children'],
          order: { sortOrder: 'ASC', name: 'ASC' },
        }),
        (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
      ).map((orms) => ORMCategoryMapper.toDomainList(orms));
    }

    // When activeOnly=true (public), filter root and children by isActive
    const qb = repo
      .createQueryBuilder('root')
      .leftJoinAndSelect(
        'root.children',
        'child',
        'child.is_active = :isActive',
        { isActive: true },
      )
      .leftJoinAndSelect(
        'child.children',
        'grandchild',
        'grandchild.is_active = :isActive',
        { isActive: true },
      )
      .where('root.parent_id IS NULL')
      .andWhere('root.is_active = :isActive', { isActive: true })
      .orderBy('root.sort_order', 'ASC')
      .addOrderBy('root.name', 'ASC')
      .addOrderBy('child.sort_order', 'ASC')
      .addOrderBy('child.name', 'ASC')
      .addOrderBy('grandchild.sort_order', 'ASC')
      .addOrderBy('grandchild.name', 'ASC');

    return ResultAsync.fromPromise(qb.getMany(), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orms) => ORMCategoryMapper.toDomainList(orms));
  }

  @WithPosition()
  findByParentId(parentId: string): ResultAsync<Category[], DomainError> {
    const repo = this.getCategoryRepository();
    return ResultAsync.fromPromise(
      repo.find({
        where: { parentId },
        order: { sortOrder: 'ASC', name: 'ASC' },
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orms) => ORMCategoryMapper.toDomainList(orms));
  }

  @WithPosition()
  create(category: Category): ResultAsync<Category, DomainError> {
    const repo = this.getCategoryRepository();
    const orm = ORMCategoryMapper.toOrm(category);
    return ResultAsync.fromPromise(repo.save(orm), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((saved) => ORMCategoryMapper.toDomain(saved));
  }

  @WithPosition()
  update(category: Category): ResultAsync<Category, DomainError> {
    const repo = this.getCategoryRepository();
    const orm = ORMCategoryMapper.toOrm(category);
    return ResultAsync.fromPromise(repo.save(orm), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((saved) => ORMCategoryMapper.toDomain(saved));
  }

  @WithPosition()
  softDelete(id: string): ResultAsync<void, DomainError> {
    const repo = this.getCategoryRepository();
    return ResultAsync.fromPromise(repo.softDelete(id), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map(() => undefined);
  }

  @WithPosition()
  hasProducts(categoryId: string): ResultAsync<boolean, DomainError> {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    const productRepo = em.getRepository(ORMProduct);
    return ResultAsync.fromPromise(
      productRepo.exists({ where: { categoryId } }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    );
  }

  @WithPosition()
  hasChildren(categoryId: string): ResultAsync<boolean, DomainError> {
    const repo = this.getCategoryRepository();
    return ResultAsync.fromPromise(
      repo.exists({ where: { parentId: categoryId } }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    );
  }

  @WithPosition()
  slugExists(
    slug: string,
    excludeId?: string,
  ): ResultAsync<boolean, DomainError> {
    const repo = this.getCategoryRepository();
    return ResultAsync.fromPromise(
      repo
        .createQueryBuilder('category')
        .where('category.slug = :slug', { slug })
        .andWhere('category.deleted_at IS NULL')
        .andWhere(excludeId ? 'category.id != :excludeId' : '1=1', {
          excludeId,
        })
        .getExists(),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    );
  }

  @WithPosition()
  findDescendantIds(categoryId: string): ResultAsync<string[], DomainError> {
    const repo = this.getCategoryRepository();
    // Recursive CTE to find all descendants
    return ResultAsync.fromPromise(
      repo
        .createQueryBuilder('category')
        .select('category.id')
        .where('category.parent_id = :categoryId', { categoryId })
        .getMany()
        .then(async (directChildren) => {
          const childIds = directChildren.map((c) => c.id);
          const descendantIds: string[] = [...childIds];

          // Recursively get descendants for each child
          for (const childId of childIds) {
            const grandchildrenResult = await this.findDescendantIds(childId);
            if (grandchildrenResult.isOk()) {
              descendantIds.push(...grandchildrenResult.value);
            }
          }

          return descendantIds;
        }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    );
  }

  @WithPosition()
  softDeleteWithDescendants(
    categoryId: string,
  ): ResultAsync<void, DomainError> {
    return this.findDescendantIds(categoryId).andThen((descendantIds) => {
      const allIds = [categoryId, ...descendantIds];
      const repo = this.getCategoryRepository();

      return ResultAsync.fromPromise(repo.softDelete(allIds), (error) =>
        createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
      ).map(() => undefined);
    });
  }

  @WithPosition()
  updateActiveStatusWithDescendants(
    categoryId: string,
    isActive: boolean,
  ): ResultAsync<void, DomainError> {
    return this.findDescendantIds(categoryId).andThen((descendantIds) => {
      const allIds = [categoryId, ...descendantIds];
      const repo = this.getCategoryRepository();

      return ResultAsync.fromPromise(
        repo.update(allIds, { isActive }),
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

  private getCategoryRepository() {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return em.getRepository(ORMCategory);
  }
}

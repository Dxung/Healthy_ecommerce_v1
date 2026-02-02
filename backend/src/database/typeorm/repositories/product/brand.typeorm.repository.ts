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
  IBrandRepository,
  BrandFilter,
} from 'src/modules/product/repository/brand.repository.interface';
import { Brand } from 'src/modules/product/models/brand.model';
import { ORMBrand, ORMProduct } from '../../entities/product';
import { ORMBrandMapper } from '../../mappers/brand.mapper.orm';

@Injectable()
export class OrmBrandRepository implements IBrandRepository {
  constructor(
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
    private readonly dataSource: DataSource,
  ) {}

  @WithPosition()
  findById(id: string): ResultAsync<Brand | null, DomainError> {
    const repo = this.getBrandRepository();
    return ResultAsync.fromPromise(repo.findOne({ where: { id } }), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orm) => (orm ? ORMBrandMapper.toDomain(orm) : null));
  }

  @WithPosition()
  findBySlug(slug: string): ResultAsync<Brand | null, DomainError> {
    const repo = this.getBrandRepository();
    return ResultAsync.fromPromise(repo.findOne({ where: { slug } }), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orm) => (orm ? ORMBrandMapper.toDomain(orm) : null));
  }

  @WithPosition()
  findAll(filter?: BrandFilter): ResultAsync<Brand[], DomainError> {
    const repo = this.getBrandRepository();
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
    ).map((orms) => ORMBrandMapper.toDomainList(orms));
  }

  @WithPosition()
  create(brand: Brand): ResultAsync<Brand, DomainError> {
    const repo = this.getBrandRepository();
    const orm = ORMBrandMapper.toOrm(brand);
    return ResultAsync.fromPromise(repo.save(orm), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((saved) => ORMBrandMapper.toDomain(saved));
  }

  @WithPosition()
  update(brand: Brand): ResultAsync<Brand, DomainError> {
    const repo = this.getBrandRepository();
    const orm = ORMBrandMapper.toOrm(brand);
    return ResultAsync.fromPromise(repo.save(orm), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((saved) => ORMBrandMapper.toDomain(saved));
  }

  @WithPosition()
  softDelete(id: string): ResultAsync<void, DomainError> {
    const repo = this.getBrandRepository();
    return ResultAsync.fromPromise(repo.softDelete(id), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map(() => undefined);
  }

  @WithPosition()
  hasProducts(brandId: string): ResultAsync<boolean, DomainError> {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    const productRepo = em.getRepository(ORMProduct);
    return ResultAsync.fromPromise(
      productRepo.exists({ where: { brandId } }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    );
  }

  @WithPosition()
  slugExists(
    slug: string,
    excludeId?: string,
  ): ResultAsync<boolean, DomainError> {
    const repo = this.getBrandRepository();
    return ResultAsync.fromPromise(
      repo
        .createQueryBuilder('brand')
        .where('brand.slug = :slug', { slug })
        .andWhere('brand.deleted_at IS NULL') // Only check non-deleted brands
        .andWhere(excludeId ? 'brand.id != :excludeId' : '1=1', { excludeId })
        .getExists(),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    );
  }

  private getEntityManager() {
    if (!this.als) return null;
    const store = this.als.getStore();
    if (!store || !store.ctx) return null;
    return store.ctx;
  }

  private getBrandRepository() {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return em.getRepository(ORMBrand);
  }
}

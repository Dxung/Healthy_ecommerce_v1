import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { DataSource } from 'typeorm';
import { ResultAsync } from 'neverthrow';
import { ITypeORMAlsStore } from 'src/shared/als/interfaces/als-store.interface';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { SHARED_ERRORS } from 'src/shared/errors/shared.errors';
import { IProductImageRepository } from 'src/modules/product/repository/product-image.repository.interface';
import { ProductImage } from 'src/modules/product/models/product-image.model';
import { ORMProductImage } from '../../entities/product';
import { ORMProductMapper } from '../../mappers/product.mapper.orm';
import {
  IMAGE_ALIAS,
  ImageColumn,
  QueryParam,
} from './product-query.constants';

@Injectable()
export class OrmProductImageRepository implements IProductImageRepository {
  constructor(
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
    private readonly dataSource: DataSource,
  ) {}

  @WithPosition()
  addImage(image: ProductImage): ResultAsync<ProductImage, DomainError> {
    const repo = this.getImageRepository();
    const orm = ORMProductMapper.imageToOrm(image);

    return ResultAsync.fromPromise(repo.save(orm), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((saved) => ORMProductMapper.imageToDomain(saved));
  }

  @WithPosition()
  removeImage(imageId: string): ResultAsync<void, DomainError> {
    const repo = this.getImageRepository();
    return ResultAsync.fromPromise(repo.delete(imageId), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map(() => undefined);
  }

  @WithPosition()
  reorderImages(
    productId: string,
    imageOrders: Array<{ imageId: string; sortOrder: number }>,
  ): ResultAsync<void, DomainError> {
    const repo = this.getImageRepository();

    const updatePromises = imageOrders.map(({ imageId, sortOrder }) =>
      repo.update(imageId, { sortOrder }),
    );

    return ResultAsync.fromPromise(Promise.all(updatePromises), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map(() => undefined);
  }

  @WithPosition()
  getImageCount(productId: string): ResultAsync<number, DomainError> {
    const repo = this.getImageRepository();
    return ResultAsync.fromPromise(
      repo.count({ where: { productId } }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    );
  }

  @WithPosition()
  findById(imageId: string): ResultAsync<ProductImage | null, DomainError> {
    const repo = this.getImageRepository();
    return ResultAsync.fromPromise(
      repo.findOne({ where: { id: imageId } }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orm) => (orm ? ORMProductMapper.imageToDomain(orm) : null));
  }

  @WithPosition()
  findByProductId(productId: string): ResultAsync<ProductImage[], DomainError> {
    const repo = this.getImageRepository();
    return ResultAsync.fromPromise(
      repo
        .createQueryBuilder(IMAGE_ALIAS)
        .where(`${ImageColumn.PRODUCT_ID} = :${QueryParam.PRODUCT_ID}`, {
          [QueryParam.PRODUCT_ID]: productId,
        })
        .orderBy(ImageColumn.SORT_ORDER, 'ASC')
        .getMany(),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orms) => orms.map((orm) => ORMProductMapper.imageToDomain(orm)));
  }

  private getEntityManager() {
    if (!this.als) return null;
    const store = this.als.getStore();
    if (!store || !store.ctx) return null;
    return store.ctx;
  }

  private getImageRepository() {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return em.getRepository(ORMProductImage);
  }
}

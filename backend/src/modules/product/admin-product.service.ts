import { Inject, Injectable } from '@nestjs/common';
import {
  IAdminProductService,
  AdminProductFilter,
} from './admin-product.service.interface';
import { PRODUCT_REPOSITORY } from 'src/database/typeorm/tokens/database.token';
import { IProductRepository } from './repository/product.repository.interface';
import { Product } from './models/product.model';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import { errAsync, okAsync, ResultAsync } from 'neverthrow';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { PRODUCT_ERRORS } from './errors/product.errors';
import type {
  PaginatedResult,
  PaginationParams,
} from 'src/shared/types/pagination.type';

@Injectable()
export class AdminProductService implements IAdminProductService {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  @WithPosition()
  getAllProducts(
    filter?: AdminProductFilter,
    pagination?: PaginationParams,
  ): ResultAsync<PaginatedResult<Product>, DomainError> {
    const paginationParams = pagination ?? { page: 1, limit: 20 };
    return this.productRepository.findAll(paginationParams, filter);
  }

  @WithPosition()
  getProductById(productId: string): ResultAsync<Product, DomainError> {
    return this.productRepository
      .findById(productId, {
        withImages: true,
        withOptions: true,
        withVariants: true,
      })
      .andThen((product) => {
        if (!product) {
          return errAsync(
            createDomainError(PRODUCT_ERRORS.PRODUCT_NOT_FOUND, {
              cause: `Product with ID ${productId} not found`,
            }),
          );
        }
        return okAsync(product);
      });
  }

  @WithPosition()
  forceDeleteProduct(productId: string): ResultAsync<void, DomainError> {
    return this.getProductById(productId).andThen(() =>
      this.productRepository.hardDelete(productId),
    );
  }
}

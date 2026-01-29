import { Inject, Injectable } from '@nestjs/common';
import {
  IPublicProductService,
  PublicProductFilter,
} from './public-product.service.interface';
import {
  PRODUCT_REPOSITORY,
  PRODUCT_VARIANT_REPOSITORY,
  CATEGORY_REPOSITORY,
} from 'src/database/typeorm/tokens/database.token';
import { IProductRepository } from './repository/product.repository.interface';
import {
  IProductVariantRepository,
  VariantWithProduct,
} from './repository/product-variant.repository.interface';
import { ICategoryRepository } from './repository/category.repository.interface';
import { Product } from './models/product.model';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import { ResultAsync, errAsync, okAsync } from 'neverthrow';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { PRODUCT_ERRORS } from './errors/product.errors';
import { ProductStatus } from 'src/database/typeorm/entities/product/enums/product-status.enum';
import type {
  PaginatedResult,
  PaginationParams,
} from 'src/shared/types/pagination.type';

@Injectable()
export class PublicProductService implements IPublicProductService {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(PRODUCT_VARIANT_REPOSITORY)
    private readonly variantRepository: IProductVariantRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  @WithPosition()
  browseProducts(
    filter?: PublicProductFilter,
    pagination?: PaginationParams,
  ): ResultAsync<PaginatedResult<Product>, DomainError> {
    const paginationParams = pagination ?? { page: 1, limit: 20 };

    // If categoryId is provided, include all descendant categories
    if (filter?.categoryId) {
      return this.categoryRepository
        .findDescendantIds(filter.categoryId)
        .andThen((descendantIds) => {
          // Include the original category ID plus all descendants
          const categoryIds = [filter.categoryId!, ...descendantIds];
          return this.productRepository.findPublic(paginationParams, {
            search: filter?.search,
            categoryIds,
            brandId: filter?.brandId,
            minPrice: filter?.minPrice,
            maxPrice: filter?.maxPrice,
            sortBy: filter?.sortBy,
            dietTagIds: filter?.dietTagIds,
            allergenFreeIds: filter?.allergenFreeIds,
          });
        });
    }

    return this.productRepository.findPublic(paginationParams, {
      search: filter?.search,
      brandId: filter?.brandId,
      minPrice: filter?.minPrice,
      maxPrice: filter?.maxPrice,
      sortBy: filter?.sortBy,
      dietTagIds: filter?.dietTagIds,
      allergenFreeIds: filter?.allergenFreeIds,
    });
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
        // Only return if active and visible
        if (!product.isVisibleToBuyers()) {
          return errAsync(
            createDomainError(PRODUCT_ERRORS.PRODUCT_NOT_FOUND, {
              cause: `Product with ID ${productId} is not available`,
            }),
          );
        }
        return okAsync(product);
      });
  }

  @WithPosition()
  getProductBySlug(slug: string): ResultAsync<Product, DomainError> {
    return this.productRepository
      .findPublic({ page: 1, limit: 1 }, { search: slug })
      .andThen((result) => {
        // Find exact slug match from results
        const product = result.items.find((p) => p.slug === slug);
        if (!product) {
          return errAsync(
            createDomainError(PRODUCT_ERRORS.PRODUCT_NOT_FOUND, {
              cause: `Product with slug "${slug}" not found`,
            }),
          );
        }
        // Load full details
        return this.getProductById(product.id);
      });
  }

  @WithPosition()
  getProductsByCategory(
    categoryId: string,
    pagination?: PaginationParams,
  ): ResultAsync<PaginatedResult<Product>, DomainError> {
    const paginationParams = pagination ?? { page: 1, limit: 20 };
    // Include all descendant categories
    return this.categoryRepository
      .findDescendantIds(categoryId)
      .andThen((descendantIds) => {
        const categoryIds = [categoryId, ...descendantIds];
        return this.productRepository.findPublic(paginationParams, { categoryIds });
      });
  }

  @WithPosition()
  getProductsByBrand(
    brandId: string,
    pagination?: PaginationParams,
  ): ResultAsync<PaginatedResult<Product>, DomainError> {
    const paginationParams = pagination ?? { page: 1, limit: 20 };
    return this.productRepository.findPublic(paginationParams, { brandId });
  }

  @WithPosition()
  getProductsByShop(
    shopId: string,
    pagination?: PaginationParams,
  ): ResultAsync<PaginatedResult<Product>, DomainError> {
    const paginationParams = pagination ?? { page: 1, limit: 20 };
    // For public view, filter by shopId with active status and visible
    return this.productRepository.findAll(paginationParams, {
      shopId,
      status: ProductStatus.ACTIVE,
      isVisible: true,
    });
  }

  @WithPosition()
  getVariantForCart(
    variantId: string,
  ): ResultAsync<VariantWithProduct | null, DomainError> {
    return this.variantRepository.findByIdWithProduct(variantId);
  }
}

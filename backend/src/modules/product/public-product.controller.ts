import {
  Controller,
  Get,
  Param,
  Inject,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ResultAsync } from 'neverthrow';
import { PUBLIC_PRODUCT_SERVICE } from './tokens/product.token';
import { IPublicProductService } from './public-product.service.interface';
import {
  ProductListResponseDto,
  ProductDetailResponseDto,
  PublicProductDetailResponseDto,
} from './dto';
import { ProductErrorHttpMapper } from './errors/product-errors-http.mapper';
import { ExceptionSource } from 'src/common/exception filters/exception-source';
import {
  CATEGORY_REPOSITORY,
  SHOP_REPOSITORY,
  ALLERGEN_TAG_REPOSITORY,
  DIET_TAG_REPOSITORY,
  PRODUCT_NUTRITION_REPOSITORY,
  BRAND_REPOSITORY,
  UNIT_REPOSITORY,
  LOCATION_REPOSITORY,
} from 'src/database/typeorm/tokens/database.token';
import { ICategoryRepository } from './repository/category.repository.interface';
import { IShopRepository } from 'src/modules/shop/repository/shop.repository.interface';
import { IAllergenTagRepository } from './repository/allergen-tag.repository.interface';
import { IDietTagRepository } from './repository/diet-tag.repository.interface';
import { IProductNutritionRepository } from './repository/product-nutrition.repository.interface';
import { IBrandRepository } from './repository/brand.repository.interface';
import { IUnitRepository } from './repository/unit.repository.interface';
import { ILocationRepository } from 'src/modules/location/repository/location.repository.interface';
import { Product } from './models/product.model';

@ApiTags('Products')
@Controller('products')
export class PublicProductController {
  constructor(
    @Inject(PUBLIC_PRODUCT_SERVICE)
    private readonly publicProductService: IPublicProductService,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
    @Inject(SHOP_REPOSITORY)
    private readonly shopRepository: IShopRepository,
    @Inject(ALLERGEN_TAG_REPOSITORY)
    private readonly allergenTagRepository: IAllergenTagRepository,
    @Inject(DIET_TAG_REPOSITORY)
    private readonly dietTagRepository: IDietTagRepository,
    @Inject(PRODUCT_NUTRITION_REPOSITORY)
    private readonly nutritionRepository: IProductNutritionRepository,
    @Inject(BRAND_REPOSITORY)
    private readonly brandRepository: IBrandRepository,
    @Inject(UNIT_REPOSITORY)
    private readonly unitRepository: IUnitRepository,
    @Inject(LOCATION_REPOSITORY)
    private readonly locationRepository: ILocationRepository,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Browse products' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name' })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    description: 'Filter by category',
  })
  @ApiQuery({
    name: 'brandId',
    required: false,
    description: 'Filter by brand',
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    type: Number,
    description: 'Minimum price',
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    type: Number,
    description: 'Maximum price',
  })
  @ApiQuery({
    name: 'dietTagIds',
    required: false,
    description:
      'Filter by diet tags (comma-separated UUIDs). Products must have ALL specified tags.',
  })
  @ApiQuery({
    name: 'allergenFreeIds',
    required: false,
    description:
      'Filter OUT products with these allergen tags (comma-separated UUIDs). Products must NOT have ANY of these tags.',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['price_asc', 'price_desc', 'newest', 'best_selling', 'rating'],
    description: 'Sort order',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiResponse({
    status: 200,
    description: 'List of products',
    type: [ProductListResponseDto],
  })
  browseProducts(
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('brandId') brandId?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('dietTagIds') dietTagIds?: string,
    @Query('allergenFreeIds') allergenFreeIds?: string,
    @Query('sortBy')
    sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'best_selling' | 'rating',
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const filter = {
      search,
      categoryId,
      brandId,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      sortBy,
      dietTagIds: dietTagIds
        ? dietTagIds.split(',').filter(Boolean)
        : undefined,
      allergenFreeIds: allergenFreeIds
        ? allergenFreeIds.split(',').filter(Boolean)
        : undefined,
    };
    const pagination = {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    };

    return this.publicProductService.browseProducts(filter, pagination).match(
      (result) => ({
        items: result.items.map((p) => new ProductListResponseDto(p)),
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      }),
      (error) => {
        throw ProductErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Get('by-slug/:slug')
  @ApiOperation({ summary: 'Get product by slug' })
  @ApiResponse({
    status: 200,
    description: 'Product details',
    type: PublicProductDetailResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  getProductBySlug(
    @Param('slug') slug: string,
  ): Promise<PublicProductDetailResponseDto> {
    return this.publicProductService
      .getProductBySlug(slug)
      .andThen((product) => this.buildPublicProductResponse(product))
      .match(
        (dto) => dto,
        (error) => {
          throw ProductErrorHttpMapper.toHttpException(
            error,
            ExceptionSource.CONTROLLER,
          );
        },
      );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({
    status: 200,
    description: 'Product details',
    type: PublicProductDetailResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  getProductById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PublicProductDetailResponseDto> {
    return this.publicProductService
      .getProductById(id)
      .andThen((product) => this.buildPublicProductResponse(product))
      .match(
        (dto) => dto,
        (error) => {
          throw ProductErrorHttpMapper.toHttpException(
            error,
            ExceptionSource.CONTROLLER,
          );
        },
      );
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Get products by category' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiResponse({
    status: 200,
    description: 'List of products',
    type: [ProductListResponseDto],
  })
  getProductsByCategory(
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pagination = {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    };

    return this.publicProductService
      .getProductsByCategory(categoryId, pagination)
      .match(
        (result) => ({
          items: result.items.map((p) => new ProductListResponseDto(p)),
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        }),
        (error) => {
          throw ProductErrorHttpMapper.toHttpException(
            error,
            ExceptionSource.CONTROLLER,
          );
        },
      );
  }

  @Get('brand/:brandId')
  @ApiOperation({ summary: 'Get products by brand' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiResponse({
    status: 200,
    description: 'List of products',
    type: [ProductListResponseDto],
  })
  getProductsByBrand(
    @Param('brandId', ParseUUIDPipe) brandId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pagination = {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    };

    return this.publicProductService
      .getProductsByBrand(brandId, pagination)
      .match(
        (result) => ({
          items: result.items.map((p) => new ProductListResponseDto(p)),
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        }),
        (error) => {
          throw ProductErrorHttpMapper.toHttpException(
            error,
            ExceptionSource.CONTROLLER,
          );
        },
      );
  }

  @Get('shop/:shopId')
  @ApiOperation({ summary: 'Get products by shop' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiResponse({
    status: 200,
    description: 'List of products',
    type: [ProductListResponseDto],
  })
  getProductsByShop(
    @Param('shopId', ParseUUIDPipe) shopId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pagination = {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    };

    return this.publicProductService
      .getProductsByShop(shopId, pagination)
      .match(
        (result) => ({
          items: result.items.map((p) => new ProductListResponseDto(p)),
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        }),
        (error) => {
          throw ProductErrorHttpMapper.toHttpException(
            error,
            ExceptionSource.CONTROLLER,
          );
        },
      );
  }

  /**
   * Builds the full public product response with all extended data.
   */
  private buildPublicProductResponse(
    product: Product,
  ): ResultAsync<PublicProductDetailResponseDto, import('src/shared/types/domain-error.type').DomainError> {
    // Load all additional data in parallel
    return ResultAsync.combine([
      this.categoryRepository.findAncestors(product.categoryId),
      this.shopRepository.findById(product.shopId),
      this.allergenTagRepository.findByProductId(product.id),
      this.dietTagRepository.findByProductId(product.id),
      this.nutritionRepository.findByProductId(product.id),
      product.brandId
        ? this.brandRepository.findById(product.brandId)
        : ResultAsync.fromSafePromise(Promise.resolve(null)),
      product.servingUnitId
        ? this.unitRepository.findById(product.servingUnitId)
        : ResultAsync.fromSafePromise(Promise.resolve(null)),
    ]).andThen(
      ([
        categoryHierarchy,
        shop,
        allergenTags,
        dietTags,
        nutrition,
        brand,
        servingUnit,
      ]) => {
        if (!shop) {
          // This shouldn't happen, but handle it gracefully
          return ResultAsync.fromSafePromise(
            Promise.reject(new Error('Shop not found')),
          );
        }

        // Get shop province name
        return this.locationRepository
          .getLocationNames(shop.provinceId, shop.districtId, shop.wardId)
          .map((locationNames) => {
            return new PublicProductDetailResponseDto(product, {
              categoryName:
                categoryHierarchy.length > 0
                  ? categoryHierarchy[categoryHierarchy.length - 1].name
                  : undefined,
              brandName: brand?.name,
              servingUnit: servingUnit
                ? {
                    id: servingUnit.id,
                    name: servingUnit.name,
                    symbol: servingUnit.symbol,
                  }
                : null,
              categoryHierarchy,
              shop,
              shopProvince: locationNames.provinceName,
              allergenTags,
              dietTags,
              nutrition,
            });
          });
      },
    );
  }
}

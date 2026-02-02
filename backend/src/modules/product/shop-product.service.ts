import { Inject, Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { v7 as uuidv7 } from 'uuid';
import {
  IShopProductService,
  ShopProductFilter,
  ProductDetailResult,
  UnitInfoData,
} from './shop-product.service.interface';
import { generateProductSlug } from 'src/shared/utils/slugify.util';
import {
  PRODUCT_REPOSITORY,
  PRODUCT_IMAGE_REPOSITORY,
  PRODUCT_INGREDIENT_REPOSITORY,
  PRODUCT_OPTION_REPOSITORY,
  PRODUCT_VARIANT_REPOSITORY,
  UNIT_REPOSITORY,
  SHOP_OFFICIAL_BRAND_REPOSITORY,
  ALLERGEN_TAG_REPOSITORY,
  DIET_TAG_REPOSITORY,
  PRODUCT_NUTRITION_REPOSITORY,
} from 'src/database/typeorm/tokens/database.token';
import { IProductRepository } from './repository/product.repository.interface';
import { IProductImageRepository } from './repository/product-image.repository.interface';
import { IProductIngredientRepository } from './repository/product-ingredient.repository.interface';
import { IProductOptionRepository } from './repository/product-option.repository.interface';
import { IProductVariantRepository } from './repository/product-variant.repository.interface';
import { IUnitRepository } from './repository/unit.repository.interface';
import { IAllergenTagRepository } from './repository/allergen-tag.repository.interface';
import { IDietTagRepository } from './repository/diet-tag.repository.interface';
import { IProductNutritionRepository } from './repository/product-nutrition.repository.interface';
import { Product } from './models/product.model';
import { ProductImage } from './models/product-image.model';
import { ProductIngredient } from './models/product-ingredient.model';
import { ProductOption } from './models/product-option.model';
import { ProductVariant } from './models/product-variant.model';
import { ProductNutrition } from './models/product-nutrition.model';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import { errAsync, okAsync, ResultAsync } from 'neverthrow';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { PRODUCT_ERRORS } from './errors/product.errors';
import { UOW_TOKEN } from 'src/shared/unitOfWork/tokens/uow.token';
import { IUow } from 'src/shared/unitOfWork/interfaces/uow.interface';
import { ITypeORMAlsStore } from 'src/shared/als/interfaces/als-store.interface';
import {
  SHOP_SERVICE,
  SHOP_BADGE_BENEFITS_SERVICE,
} from '../shop/tokens/shop.token';
import { IShopService } from '../shop/shop.service.interface';
import { IShopBadgeBenefitsService } from '../shop/shop-badge-benefits.service.interface';
import type { IShopOfficialBrandRepository } from '../shop/repository/shop-official-brand.repository.interface';
import { IMAGE_PROCESSING_SERVICE } from 'src/shared/image-processing/tokens/image-processing.token';
import type { IImageProcessingService } from 'src/shared/image-processing/interfaces/image-processing.service.interface';
import type { CreateProductArgumentDto } from './dto/product/create-product-argument.dto';
import type { UpdateProductArgumentDto } from './dto/product/update-product-argument.dto';
import type { CreateVariantArgumentDto } from './dto/product/create-variant-argument.dto';
import type { UpdateVariantArgumentDto } from './dto/product/update-variant-argument.dto';
import type {
  PaginatedResult,
  PaginationParams,
} from 'src/shared/types/pagination.type';
import { UnitCategory } from 'src/database/typeorm/entities/product/enums/unit-category.enum';

@Injectable()
export class ShopProductService implements IShopProductService {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(PRODUCT_IMAGE_REPOSITORY)
    private readonly imageRepository: IProductImageRepository,
    @Inject(PRODUCT_INGREDIENT_REPOSITORY)
    private readonly ingredientRepository: IProductIngredientRepository,
    @Inject(PRODUCT_OPTION_REPOSITORY)
    private readonly optionRepository: IProductOptionRepository,
    @Inject(PRODUCT_VARIANT_REPOSITORY)
    private readonly variantRepository: IProductVariantRepository,
    @Inject(UNIT_REPOSITORY)
    private readonly unitRepository: IUnitRepository,
    @Inject(SHOP_OFFICIAL_BRAND_REPOSITORY)
    private readonly officialBrandRepository: IShopOfficialBrandRepository,
    @Inject(ALLERGEN_TAG_REPOSITORY)
    private readonly allergenTagRepository: IAllergenTagRepository,
    @Inject(DIET_TAG_REPOSITORY)
    private readonly dietTagRepository: IDietTagRepository,
    @Inject(PRODUCT_NUTRITION_REPOSITORY)
    private readonly nutritionRepository: IProductNutritionRepository,
    @Inject(SHOP_SERVICE)
    private readonly shopService: IShopService,
    @Inject(SHOP_BADGE_BENEFITS_SERVICE)
    private readonly badgeBenefitsService: IShopBadgeBenefitsService,
    @Inject(IMAGE_PROCESSING_SERVICE)
    private readonly imageProcessingService: IImageProcessingService,
    @Inject(UOW_TOKEN)
    private readonly transactionUow: IUow,
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
  ) {}

  // ======================== HELPERS ========================

  /**
   * Gets the current user's shop ID from ALS.
   */
  private getCurrentShopId(): ResultAsync<string, DomainError> {
    return this.shopService.getMyShop().andThen((shop) => {
      if (!shop) {
        return errAsync(
          createDomainError(PRODUCT_ERRORS.USER_HAS_NO_SHOP, {
            cause: 'User does not own a shop',
          }),
        );
      }
      return okAsync(shop.id);
    });
  }

  /**
   * Gets and validates a product owned by the current user's shop.
   */
  private getOwnedProduct(
    productId: string,
  ): ResultAsync<Product, DomainError> {
    return this.getCurrentShopId().andThen((shopId) =>
      this.productRepository
        .findById(productId, {
          withImages: true,
          withOptions: true,
          withVariants: true,
          withUnits: true,
        })
        .andThen((product) => {
          if (!product) {
            return errAsync(
              createDomainError(PRODUCT_ERRORS.PRODUCT_NOT_FOUND, {
                cause: `Product with ID ${productId} not found`,
              }),
            );
          }
          if (!product.isOwnedByShop(shopId)) {
            return errAsync(
              createDomainError(PRODUCT_ERRORS.PRODUCT_NOT_OWNED, {
                cause: `Product ${productId} is not owned by shop ${shopId}`,
              }),
            );
          }
          return okAsync(product);
        }),
    );
  }

  // ======================== PRODUCT CRUD ========================

  @WithPosition()
  getMyProducts(
    filter?: ShopProductFilter,
    pagination?: PaginationParams,
  ): ResultAsync<PaginatedResult<Product>, DomainError> {
    return this.getCurrentShopId().andThen((shopId) => {
      const productFilter = {
        shopId,
        search: filter?.search,
        categoryId: filter?.categoryId,
        status: filter?.status,
      };
      const paginationParams = pagination ?? { page: 1, limit: 20 };
      return this.productRepository.findAll(paginationParams, productFilter);
    });
  }

  @WithPosition()
  getMyProductById(productId: string): ResultAsync<Product, DomainError> {
    return this.getOwnedProduct(productId);
  }

  @WithPosition()
  getMyProductDetailById(
    productId: string,
  ): ResultAsync<ProductDetailResult, DomainError> {
    return this.getOwnedProduct(productId).andThen((product) => {
      // Collect all unit IDs that need to be resolved
      const unitIds: string[] = [];
      if (product.servingUnitId) {
        unitIds.push(product.servingUnitId);
      }
      for (const variant of product.variants) {
        if (variant.sellingUnitId) {
          unitIds.push(variant.sellingUnitId);
        }
      }

      // If no units to resolve, return product with empty unit info
      if (unitIds.length === 0) {
        return okAsync({
          product,
          servingUnit: null,
          variantUnitMap: new Map<string, UnitInfoData>(),
        });
      }

      // Fetch all required units
      const uniqueUnitIds = [...new Set(unitIds)];
      return this.resolveUnitInfo(uniqueUnitIds).map((unitMap) => {
        const servingUnit = product.servingUnitId
          ? (unitMap.get(product.servingUnitId) ?? null)
          : null;

        return {
          product,
          servingUnit,
          variantUnitMap: unitMap,
        };
      });
    });
  }

  /**
   * Resolves unit IDs to unit info.
   */
  private resolveUnitInfo(
    unitIds: string[],
  ): ResultAsync<Map<string, UnitInfoData>, DomainError> {
    if (unitIds.length === 0) {
      return okAsync(new Map<string, UnitInfoData>());
    }

    return this.unitRepository.findByIds(unitIds).map((units) => {
      const unitMap = new Map<string, UnitInfoData>();
      for (const unit of units) {
        unitMap.set(unit.id, {
          id: unit.id,
          name: unit.name,
          symbol: unit.symbol,
        });
      }
      return unitMap;
    });
  }

  /**
   * Validates that a serving unit is a measurement unit.
   */
  private validateServingUnit(
    servingUnitId: string | null | undefined,
  ): ResultAsync<void, DomainError> {
    if (!servingUnitId) {
      return okAsync(undefined);
    }

    return this.unitRepository.findById(servingUnitId).andThen((unit) => {
      if (!unit) {
        return errAsync(
          createDomainError(PRODUCT_ERRORS.UNIT_NOT_FOUND, {
            cause: `Unit ${servingUnitId} not found`,
          }),
        );
      }
      if (unit.category !== UnitCategory.MEASUREMENT) {
        return errAsync(
          createDomainError(PRODUCT_ERRORS.UNIT_INVALID_SERVING_UNIT, {
            cause: `Unit ${unit.symbol} is a ${unit.category} unit, not a measurement unit`,
          }),
        );
      }
      return okAsync(undefined);
    });
  }

  /**
   * Validates that a selling unit is a selling unit.
   */
  private validateSellingUnit(
    sellingUnitId: string | null | undefined,
  ): ResultAsync<void, DomainError> {
    if (!sellingUnitId) {
      return okAsync(undefined);
    }

    return this.unitRepository.findById(sellingUnitId).andThen((unit) => {
      if (!unit) {
        return errAsync(
          createDomainError(PRODUCT_ERRORS.UNIT_NOT_FOUND, {
            cause: `Unit ${sellingUnitId} not found`,
          }),
        );
      }
      if (unit.category !== UnitCategory.SELLING) {
        return errAsync(
          createDomainError(PRODUCT_ERRORS.UNIT_INVALID_SELLING_UNIT, {
            cause: `Unit ${unit.symbol} is a ${unit.category} unit, not a selling unit`,
          }),
        );
      }
      return okAsync(undefined);
    });
  }

  /**
   * Validates selling units for all variants in parallel.
   */
  private validateVariantSellingUnits(
    variants: { sellingUnitId?: string | null }[],
  ): ResultAsync<void, DomainError> {
    const validations = variants
      .filter((v) => v.sellingUnitId)
      .map((v) => this.validateSellingUnit(v.sellingUnitId));

    if (validations.length === 0) {
      return okAsync(undefined);
    }

    return ResultAsync.combine(validations).map(() => undefined);
  }

  @WithPosition()
  createProduct(
    dto: CreateProductArgumentDto,
  ): ResultAsync<Product, DomainError> {
    return (
      this.getCurrentShopId()
        // Check official shop brand restriction
        .andThen((shopId) =>
          this.checkOfficialBrandRestriction(shopId, dto.brandId).map(
            () => shopId,
          ),
        )
        // Validate units
        .andThen((shopId) =>
          this.validateServingUnit(dto.servingUnitId).map(() => shopId),
        )
        .andThen((shopId) =>
          this.validateVariantSellingUnits(dto.variants).map(() => shopId),
        )
        // Check product slot limit from badge benefits
        .andThen((shopId) =>
          this.checkProductSlotLimit(shopId).map(() => shopId),
        )
        // Create product in transaction
        .andThen((shopId) =>
          this.transactionUow.executeInTransaction(() =>
            this.createProductInTransaction(shopId, dto),
          ),
        )
    );
  }

  /**
   * Checks if shop has reached their product slot limit from badges.
   * Returns ok if under limit or no limit, error if at or over limit.
   */
  private checkProductSlotLimit(
    shopId: string,
  ): ResultAsync<void, DomainError> {
    return ResultAsync.combine([
      this.badgeBenefitsService.getEffectiveMaxProductSlots(shopId),
      this.productRepository.countActiveByShopId(shopId),
    ]).andThen(([maxSlots, currentCount]) => {
      // null means unlimited
      if (maxSlots === null) {
        return okAsync(undefined);
      }

      if (currentCount >= maxSlots) {
        return errAsync(
          createDomainError(PRODUCT_ERRORS.PRODUCT_SLOT_LIMIT_REACHED, {
            cause: `Shop has ${currentCount} products, limit is ${maxSlots} from badge benefits`,
          }),
        );
      }

      return okAsync(undefined);
    });
  }

  /**
   * Checks if official shop can create product for the given brand.
   * If shop is official, they can only create products for brands they're official for.
   * Non-official shops can create products for any brand.
   */
  private checkOfficialBrandRestriction(
    shopId: string,
    brandId: string | null | undefined,
  ): ResultAsync<void, DomainError> {
    // First check if shop has any official brands
    return this.officialBrandRepository
      .hasAnyActiveOfficialBrand(shopId)
      .andThen((isOfficialShop) => {
        // If shop is not official, no restriction
        if (!isOfficialShop) {
          return okAsync(undefined);
        }

        // Shop is official - must create products only for official brands
        if (!brandId) {
          // No brand specified but shop is official - block
          return errAsync(
            createDomainError(PRODUCT_ERRORS.OFFICIAL_SHOP_BRAND_REQUIRED, {
              cause:
                'Shop chính hãng phải chọn thương hiệu đã đăng ký khi tạo sản phẩm',
            }),
          );
        }

        // Check if brand is in official list
        return this.officialBrandRepository
          .isOfficialForBrand(shopId, brandId)
          .andThen((isOfficialForBrand) => {
            if (!isOfficialForBrand) {
              return errAsync(
                createDomainError(
                  PRODUCT_ERRORS.OFFICIAL_SHOP_UNAUTHORIZED_BRAND,
                  {
                    cause:
                      'Shop chính hãng chỉ có thể tạo sản phẩm cho thương hiệu đã đăng ký',
                  },
                ),
              );
            }
            return okAsync(undefined);
          });
      });
  }

  /**
   * Creates product with options and variants inside a transaction.
   */
  private createProductInTransaction(
    shopId: string,
    dto: CreateProductArgumentDto,
  ): ResultAsync<Product, DomainError> {
    // Generate productId first, then create slug with embedded IDs
    const productId = uuidv7();
    const slug = generateProductSlug(dto.name, shopId, productId);

    const product = Product.create({
      id: productId,
      shopId,
      categoryId: dto.categoryId,
      brandId: dto.brandId ?? null,
      name: dto.name,
      slug,
      description: dto.description ?? null,
      thumbnailUrl: dto.thumbnailUrl,
      servingSize: dto.servingSize ?? null,
      servingUnitId: dto.servingUnitId ?? null,
    });

    return (
      this.productRepository
        .create(product)
        // Create options
        .andThen((savedProduct) =>
          this.createOptionsForProduct(savedProduct.id, dto.options ?? []).map(
            (options) => ({ savedProduct, options }),
          ),
        )
        // Create variants
        .andThen(({ savedProduct, options }) =>
          this.createVariantsForProduct(
            savedProduct.id,
            dto.variants,
            options,
          ).map((variants) => ({ savedProduct, options, variants })),
        )
        // Create ingredients
        .andThen(({ savedProduct, options, variants }) =>
          this.createIngredientsForProduct(
            savedProduct.id,
            dto.ingredients ?? [],
          ).map((ingredients) => ({
            savedProduct,
            options,
            variants,
            ingredients,
          })),
        )
        // Set allergen tags
        .andThen((ctx) =>
          this.allergenTagRepository
            .setProductAllergenTags(
              ctx.savedProduct.id,
              dto.allergenTagIds ?? [],
            )
            .map(() => ctx),
        )
        // Set diet tags
        .andThen((ctx) =>
          this.dietTagRepository
            .setProductDietTags(ctx.savedProduct.id, dto.dietTagIds ?? [])
            .map(() => ctx),
        )
        // Create nutrition
        .andThen((ctx) =>
          this.createNutritionForProduct(ctx.savedProduct.id, dto).map(
            () => ctx,
          ),
        )
        // Finalize product
        .andThen(({ savedProduct, options, variants, ingredients }) => {
          savedProduct.setOptions(options);
          savedProduct.setVariants(variants);
          savedProduct.setIngredients(ingredients);
          return this.productRepository.update(savedProduct);
        })
    );
  }

  private createOptionsForProduct(
    productId: string,
    optionDtos: { name: string; values: string[] }[],
  ): ResultAsync<ProductOption[], DomainError> {
    const options = optionDtos.map((dto, index) =>
      ProductOption.create(productId, dto.name, dto.values, index),
    );

    return this.optionRepository
      .setOptions(productId, options)
      .map(() => options);
  }

  private createVariantsForProduct(
    productId: string,
    variantDtos: CreateProductArgumentDto['variants'],
    options: ProductOption[],
  ): ResultAsync<ProductVariant[], DomainError> {
    const variants: ProductVariant[] = [];

    for (const dto of variantDtos) {
      const variant = ProductVariant.create({
        productId,
        sku: dto.sku,
        name: dto.name,
        price: dto.price,
        compareAtPrice: dto.compareAtPrice,
        stockQuantity: dto.stockQuantity,
        imageUrl: dto.imageUrl,
        sellingUnitId: dto.sellingUnitId ?? null,
        unitQuantity: dto.unitQuantity ?? null,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
      });

      // Map option value indices to actual option value IDs
      if (dto.optionValueIndices && options.length > 0) {
        const optionValueIds: string[] = [];
        for (
          let i = 0;
          i < dto.optionValueIndices.length && i < options.length;
          i++
        ) {
          const valueIndex = dto.optionValueIndices[i];
          const option = options[i];
          if (option.values[valueIndex]) {
            optionValueIds.push(option.values[valueIndex].id);
          }
        }
        variant.setOptionValueIds(optionValueIds);
      }

      variants.push(variant);
    }

    // Save all variants
    return this.saveVariants(variants);
  }

  private saveVariants(
    variants: ProductVariant[],
  ): ResultAsync<ProductVariant[], DomainError> {
    if (variants.length === 0) {
      return okAsync([]);
    }

    // Save all variants in parallel
    return ResultAsync.combine(
      variants.map((variant) => this.variantRepository.addVariant(variant)),
    );
  }

  private createIngredientsForProduct(
    productId: string,
    ingredientNames: string[],
  ): ResultAsync<ProductIngredient[], DomainError> {
    if (ingredientNames.length === 0) {
      return okAsync([]);
    }

    const ingredients = ingredientNames.map((name, index) =>
      ProductIngredient.create(productId, name.trim(), index),
    );

    return this.ingredientRepository
      .setIngredients(productId, ingredients)
      .map(() => ingredients);
  }

  private createNutritionForProduct(
    productId: string,
    dto: CreateProductArgumentDto,
  ): ResultAsync<void, DomainError> {
    // Only create nutrition if any nutrition field is provided
    const nutrition = dto.nutrition;
    if (
      !nutrition ||
      (nutrition.calories === undefined &&
        nutrition.protein === undefined &&
        nutrition.carbohydrates === undefined &&
        nutrition.sugar === undefined &&
        nutrition.fat === undefined &&
        nutrition.saturatedFat === undefined &&
        nutrition.fiber === undefined &&
        nutrition.sodium === undefined)
    ) {
      return okAsync(undefined);
    }

    // Get serving unit symbol (default to 'g' if not specified)
    const servingUnit = dto.servingUnitId ? 'g' : 'g'; // Will be resolved later if needed

    const productNutrition = ProductNutrition.create({
      productId,
      servingSize: dto.servingSize ?? 100,
      servingUnit,
      calories: nutrition.calories ?? null,
      protein: nutrition.protein ?? null,
      carbohydrates: nutrition.carbohydrates ?? null,
      sugar: nutrition.sugar ?? null,
      fat: nutrition.fat ?? null,
      saturatedFat: nutrition.saturatedFat ?? null,
      fiber: nutrition.fiber ?? null,
      sodium: nutrition.sodium ?? null,
    });

    return this.nutritionRepository
      .create(productNutrition)
      .map(() => undefined);
  }

  @WithPosition()
  updateProduct(
    productId: string,
    dto: UpdateProductArgumentDto,
  ): ResultAsync<Product, DomainError> {
    return this.getOwnedProduct(productId).andThen((product) => {
      // Check slug uniqueness if changing
      const slugCheck =
        dto.slug && dto.slug !== product.slug
          ? this.productRepository
              .slugExistsInShop(product.shopId, dto.slug, productId)
              .andThen((exists) => {
                if (exists) {
                  return errAsync(
                    createDomainError(PRODUCT_ERRORS.PRODUCT_SLUG_EXISTS, {
                      cause: `Slug "${dto.slug}" already exists in this shop`,
                    }),
                  );
                }
                return okAsync(undefined);
              })
          : okAsync(undefined);

      return slugCheck
        .andThen(() => {
          // Validate serving unit if provided
          if (dto.servingUnitId !== undefined) {
            return this.validateServingUnit(dto.servingUnitId);
          }
          return okAsync(undefined);
        })
        .andThen(() => {
          // If trying to show the product, check if it's allowed for official shops
          if (dto.isVisible === true && !product.isVisible) {
            return this.checkCanShowProduct(product);
          }
          return okAsync(undefined);
        })
        .andThen(() => {
          const updateResult = product.updateInfo({
            categoryId: dto.categoryId,
            brandId: dto.brandId,
            name: dto.name,
            slug: dto.slug,
            description: dto.description,
            thumbnailUrl: dto.thumbnailUrl,
            isVisible: dto.isVisible,
            servingSize: dto.servingSize,
            servingUnitId: dto.servingUnitId,
          });

          if (updateResult.isErr()) {
            return errAsync(updateResult.error);
          }

          return this.productRepository.update(product);
        });
    });
  }

  /**
   * Checks if a hidden product can be shown.
   * Official shops cannot show products of non-official brands.
   */
  private checkCanShowProduct(
    product: Product,
  ): ResultAsync<void, DomainError> {
    return this.officialBrandRepository
      .hasAnyActiveOfficialBrand(product.shopId)
      .andThen((isOfficialShop) => {
        // Non-official shops can show any product
        if (!isOfficialShop) {
          return okAsync(undefined);
        }

        // Official shop - check if product's brand is official
        if (!product.brandId) {
          // Product has no brand but shop is official - cannot show
          return errAsync(
            createDomainError(
              PRODUCT_ERRORS.OFFICIAL_SHOP_CANNOT_SHOW_NON_OFFICIAL_PRODUCT,
              {
                cause:
                  'Shop chính hãng không thể hiện sản phẩm không có thương hiệu',
              },
            ),
          );
        }

        return this.officialBrandRepository
          .isOfficialForBrand(product.shopId, product.brandId)
          .andThen((isOfficialForBrand) => {
            if (!isOfficialForBrand) {
              return errAsync(
                createDomainError(
                  PRODUCT_ERRORS.OFFICIAL_SHOP_CANNOT_SHOW_NON_OFFICIAL_PRODUCT,
                  {
                    cause:
                      'Shop chính hãng không thể hiện sản phẩm của thương hiệu chưa đăng ký chính hãng',
                  },
                ),
              );
            }
            return okAsync(undefined);
          });
      });
  }

  @WithPosition()
  deleteProduct(productId: string): ResultAsync<void, DomainError> {
    return this.getOwnedProduct(productId).andThen((product) => {
      // DRAFT products can be hard deleted, others are soft deleted
      if (product.canBeHardDeleted()) {
        return this.productRepository.hardDelete(productId);
      }
      product.softDelete();
      return this.productRepository.update(product).map(() => undefined);
    });
  }

  // ======================== PUBLISH / ACTIVATE / DEACTIVATE ========================

  @WithPosition()
  publishProduct(productId: string): ResultAsync<Product, DomainError> {
    return this.getOwnedProduct(productId).andThen((product) => {
      const publishResult = product.publish();
      if (publishResult.isErr()) {
        return errAsync(publishResult.error);
      }
      return this.productRepository.update(product);
    });
  }

  @WithPosition()
  deactivateProduct(productId: string): ResultAsync<Product, DomainError> {
    return this.getOwnedProduct(productId).andThen((product) => {
      const deactivateResult = product.deactivate();
      if (deactivateResult.isErr()) {
        return errAsync(deactivateResult.error);
      }
      return this.productRepository.update(product);
    });
  }

  @WithPosition()
  activateProduct(productId: string): ResultAsync<Product, DomainError> {
    return this.getOwnedProduct(productId).andThen((product) => {
      const activateResult = product.activate();
      if (activateResult.isErr()) {
        return errAsync(activateResult.error);
      }
      return this.productRepository.update(product);
    });
  }

  // ======================== IMAGE MANAGEMENT ========================

  private static readonly PRODUCT_IMAGE_PRESET = 'Healthy_product_image';

  @WithPosition()
  uploadImage(file: Express.Multer.File): ResultAsync<string, DomainError> {
    return this.imageProcessingService
      .uploadImage(file.buffer, ShopProductService.PRODUCT_IMAGE_PRESET)
      .map((result) => result.url);
  }

  @WithPosition()
  addImage(
    productId: string,
    imageUrl: string,
  ): ResultAsync<ProductImage, DomainError> {
    return this.getOwnedProduct(productId).andThen(() => {
      // Check image limit (max 5)
      return this.imageRepository.getImageCount(productId).andThen((count) => {
        if (count >= 5) {
          return errAsync(
            createDomainError(PRODUCT_ERRORS.IMAGE_LIMIT_EXCEEDED, {
              cause: 'Maximum 5 gallery images allowed per product',
            }),
          );
        }

        const image = ProductImage.create(productId, imageUrl, count);
        return this.imageRepository.addImage(image);
      });
    });
  }

  @WithPosition()
  removeImage(
    productId: string,
    imageId: string,
  ): ResultAsync<void, DomainError> {
    return this.getOwnedProduct(productId).andThen(() =>
      this.imageRepository.findById(imageId).andThen((image) => {
        if (!image || image.productId !== productId) {
          return errAsync(
            createDomainError(PRODUCT_ERRORS.IMAGE_NOT_FOUND, {
              cause: `Image ${imageId} not found for product ${productId}`,
            }),
          );
        }
        return this.imageRepository.removeImage(imageId);
      }),
    );
  }

  @WithPosition()
  reorderImages(
    productId: string,
    imageIds: string[],
  ): ResultAsync<void, DomainError> {
    return this.getOwnedProduct(productId).andThen(() => {
      // Convert imageIds array to array with sortOrder based on position
      const imageOrders = imageIds.map((imageId, index) => ({
        imageId,
        sortOrder: index,
      }));
      return this.imageRepository.reorderImages(productId, imageOrders);
    });
  }

  // ======================== VARIANT MANAGEMENT ========================

  @WithPosition()
  addVariant(
    productId: string,
    dto: CreateVariantArgumentDto,
  ): ResultAsync<ProductVariant, DomainError> {
    return this.getOwnedProduct(productId).andThen((product) => {
      if (!product.canBeEdited()) {
        return errAsync(
          createDomainError(PRODUCT_ERRORS.PRODUCT_CANNOT_EDIT, {
            cause: 'Product cannot be edited in its current status',
          }),
        );
      }

      // Validate selling unit before creating
      return this.validateSellingUnit(dto.sellingUnitId).andThen(() => {
        const variant = ProductVariant.create({
          productId,
          sku: dto.sku,
          name: dto.name,
          price: dto.price,
          compareAtPrice: dto.compareAtPrice,
          stockQuantity: dto.stockQuantity,
          imageUrl: dto.imageUrl,
          sellingUnitId: dto.sellingUnitId ?? null,
          unitQuantity: dto.unitQuantity ?? null,
          expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
          optionValueIds: dto.optionValueIds,
        });

        return this.transactionUow.executeInTransaction(() =>
          this.variantRepository.addVariant(variant).andThen((savedVariant) => {
            // Set option value mappings if provided
            if (dto.optionValueIds?.length) {
              return this.variantRepository
                .setVariantOptionValues(savedVariant.id, dto.optionValueIds)
                .map(() => savedVariant);
            }
            return okAsync(savedVariant);
          }),
        );
      });
    });
  }

  @WithPosition()
  updateVariant(
    productId: string,
    variantId: string,
    dto: UpdateVariantArgumentDto,
  ): ResultAsync<ProductVariant, DomainError> {
    return this.getOwnedProduct(productId).andThen((product) => {
      if (!product.canBeEdited()) {
        return errAsync(
          createDomainError(PRODUCT_ERRORS.PRODUCT_CANNOT_EDIT, {
            cause: 'Product cannot be edited in its current status',
          }),
        );
      }

      return this.variantRepository.findById(variantId).andThen((variant) => {
        if (!variant || variant.productId !== productId) {
          return errAsync(
            createDomainError(PRODUCT_ERRORS.VARIANT_NOT_FOUND, {
              cause: `Variant ${variantId} not found for product ${productId}`,
            }),
          );
        }

        // Validate selling unit if provided
        const unitValidation =
          dto.sellingUnitId !== undefined
            ? this.validateSellingUnit(dto.sellingUnitId)
            : okAsync(undefined);

        return unitValidation.andThen(() => {
          // Update variant info
          if (
            dto.sku !== undefined ||
            dto.name !== undefined ||
            dto.imageUrl !== undefined ||
            dto.sellingUnitId !== undefined ||
            dto.unitQuantity !== undefined ||
            dto.expiryDate !== undefined
          ) {
            variant.updateInfo({
              sku: dto.sku,
              name: dto.name,
              imageUrl: dto.imageUrl,
              sellingUnitId: dto.sellingUnitId,
              unitQuantity: dto.unitQuantity,
              expiryDate:
                dto.expiryDate === null
                  ? null
                  : dto.expiryDate
                    ? new Date(dto.expiryDate)
                    : undefined,
            });
          }

          // Update price
          if (dto.price !== undefined) {
            const priceResult = variant.updatePrice(
              dto.price,
              dto.compareAtPrice,
            );
            if (priceResult.isErr()) {
              return errAsync(priceResult.error);
            }
          }

          // Update stock
          if (dto.stockQuantity !== undefined) {
            variant.setStockQuantity(dto.stockQuantity);
          }

          // Update active status
          if (dto.isActive !== undefined) {
            if (dto.isActive) {
              variant.activate();
            } else {
              variant.deactivate();
            }
          }

          return this.variantRepository.updateVariant(variant);
        });
      });
    });
  }

  @WithPosition()
  deleteVariant(
    productId: string,
    variantId: string,
  ): ResultAsync<void, DomainError> {
    return this.getOwnedProduct(productId).andThen((product) => {
      if (!product.canBeEdited()) {
        return errAsync(
          createDomainError(PRODUCT_ERRORS.PRODUCT_CANNOT_EDIT, {
            cause: 'Product cannot be edited in its current status',
          }),
        );
      }

      // Fetch count and variant in parallel
      return ResultAsync.combine([
        this.variantRepository.getActiveVariantCount(productId),
        this.variantRepository.findById(variantId),
      ] as const).andThen(([count, variant]) => {
        if (!variant || variant.productId !== productId) {
          return errAsync(
            createDomainError(PRODUCT_ERRORS.VARIANT_NOT_FOUND, {
              cause: `Variant ${variantId} not found for product ${productId}`,
            }),
          );
        }

        // If this is the last active variant, prevent deletion
        if (count <= 1 && variant.isActive) {
          return errAsync(
            createDomainError(PRODUCT_ERRORS.VARIANT_LAST_CANNOT_DELETE, {
              cause: 'Cannot delete the last active variant',
            }),
          );
        }

        return this.variantRepository.softDeleteVariant(variantId);
      });
    });
  }
}

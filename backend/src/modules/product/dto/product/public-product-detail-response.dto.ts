import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Product } from '../../models/product.model';
import { ProductImageResponseDto } from './product-image-response.dto';
import { ProductOptionResponseDto } from './product-option-response.dto';
import {
  ProductVariantResponseDto,
  UnitInfo,
} from './product-variant-response.dto';
import { Category } from '../../models/category.model';
import { Shop } from 'src/modules/shop/models/shop.model';
import { AllergenTag } from '../../models/allergen-tag.model';
import { DietTag } from '../../models/diet-tag.model';
import { ProductNutrition } from '../../models/product-nutrition.model';

/**
 * Response DTO for category breadcrumb.
 */
export class CategoryBreadcrumbDto {
  @ApiProperty({ description: 'Category ID' })
  id: string;

  @ApiProperty({ description: 'Category name' })
  name: string;

  @ApiProperty({ description: 'Category slug' })
  slug: string;

  constructor(category: Category) {
    this.id = category.id;
    this.name = category.name;
    this.slug = category.slug;
  }

  static fromList(categories: Category[]): CategoryBreadcrumbDto[] {
    return categories.map((c) => new CategoryBreadcrumbDto(c));
  }
}

/**
 * Response DTO for tag information.
 */
export class TagDto {
  @ApiProperty({ description: 'Tag ID' })
  id: string;

  @ApiProperty({ description: 'Tag name' })
  name: string;

  @ApiProperty({ description: 'Tag slug' })
  slug: string;

  @ApiPropertyOptional({ description: 'Tag description', nullable: true })
  description: string | null;

  @ApiPropertyOptional({ description: 'Tag icon URL', nullable: true })
  iconUrl: string | null;

  constructor(tag: AllergenTag | DietTag) {
    this.id = tag.id;
    this.name = tag.name;
    this.slug = tag.slug;
    this.description = tag.description;
    this.iconUrl = tag.iconUrl;
  }
}

/**
 * Response DTO for shop info in product detail.
 */
export class ShopInfoDto {
  @ApiProperty({ description: 'Shop ID' })
  id: string;

  @ApiProperty({ description: 'Shop name' })
  name: string;

  @ApiProperty({ description: 'Shop slug' })
  slug: string;

  @ApiPropertyOptional({ description: 'Shop logo URL', nullable: true })
  logoUrl: string | null;

  @ApiPropertyOptional({ description: 'Shop cover URL', nullable: true })
  coverUrl: string | null;

  @ApiProperty({ description: 'Average rating' })
  averageRating: number;

  @ApiProperty({ description: 'Total ratings count' })
  totalRatings: number;

  @ApiProperty({ description: 'Total products count' })
  totalProducts: number;

  @ApiProperty({ description: 'Shop badges' })
  badges: string[];

  @ApiProperty({ description: 'Shop created date' })
  createdAt: string;

  @ApiPropertyOptional({ description: 'Shop province', nullable: true })
  province: string | null;

  constructor(shop: Shop, province?: string | null) {
    this.id = shop.id;
    this.name = shop.name;
    this.slug = shop.slug;
    this.logoUrl = shop.logoUrl;
    this.coverUrl = shop.coverUrl;
    this.averageRating = shop.averageRating;
    this.totalRatings = shop.totalRatings;
    this.totalProducts = shop.totalProducts;
    this.badges = shop.badges;
    this.createdAt = shop.createdAt.toISOString();
    this.province = province ?? null;
  }
}

/**
 * Response DTO for nutrition info.
 */
export class NutritionInfoDto {
  @ApiPropertyOptional({ description: 'Serving size', nullable: true })
  servingSize: number | null;

  @ApiPropertyOptional({ description: 'Serving unit ID', nullable: true })
  servingUnitId: string | null;

  @ApiPropertyOptional({ description: 'Serving unit name', nullable: true })
  servingUnitName: string | null;

  @ApiPropertyOptional({ description: 'Serving unit abbreviation', nullable: true })
  servingUnitAbbreviation: string | null;

  @ApiPropertyOptional({ description: 'Calories (kcal)', nullable: true })
  calories: number | null;

  @ApiPropertyOptional({ description: 'Protein (g)', nullable: true })
  protein: number | null;

  @ApiPropertyOptional({ description: 'Carbohydrates (g)', nullable: true })
  carbohydrates: number | null;

  @ApiPropertyOptional({ description: 'Sugar (g)', nullable: true })
  sugar: number | null;

  @ApiPropertyOptional({ description: 'Fat (g)', nullable: true })
  fat: number | null;

  @ApiPropertyOptional({ description: 'Saturated fat (g)', nullable: true })
  saturatedFat: number | null;

  @ApiPropertyOptional({ description: 'Fiber (g)', nullable: true })
  fiber: number | null;

  @ApiPropertyOptional({ description: 'Sodium (mg)', nullable: true })
  sodium: number | null;

  constructor(
    nutrition: ProductNutrition,
    servingSize: number | null,
    servingUnit?: { id: string; name: string; symbol: string } | null,
  ) {
    this.servingSize = servingSize;
    this.servingUnitId = servingUnit?.id ?? null;
    this.servingUnitName = servingUnit?.name ?? null;
    this.servingUnitAbbreviation = servingUnit?.symbol ?? null;
    this.calories = nutrition.calories;
    this.protein = nutrition.protein;
    this.carbohydrates = nutrition.carbohydrates;
    this.sugar = nutrition.sugar;
    this.fat = nutrition.fat;
    this.saturatedFat = nutrition.saturatedFat;
    this.fiber = nutrition.fiber;
    this.sodium = nutrition.sodium;
  }
}

/**
 * Response DTO for public product details.
 * Contains all information needed for product detail page.
 */
export class PublicProductDetailResponseDto {
  @ApiProperty({ description: 'Product ID' })
  id: string;

  @ApiProperty({ description: 'Product name' })
  name: string;

  @ApiProperty({ description: 'URL-friendly slug' })
  slug: string;

  @ApiPropertyOptional({ description: 'Product description', nullable: true })
  description: string | null;

  @ApiPropertyOptional({ description: 'Short description', nullable: true })
  shortDescription: string | null;

  @ApiPropertyOptional({ description: 'Category ID', nullable: true })
  categoryId: string | null;

  @ApiPropertyOptional({ description: 'Category name', nullable: true })
  categoryName: string | null;

  @ApiPropertyOptional({ description: 'Brand ID', nullable: true })
  brandId: string | null;

  @ApiPropertyOptional({ description: 'Brand name', nullable: true })
  brandName: string | null;

  @ApiProperty({ description: 'Thumbnail URL' })
  thumbnailUrl: string | null;

  @ApiProperty({ description: 'View count' })
  viewCount: number;

  @ApiProperty({ description: 'Sold count' })
  soldCount: number;

  @ApiProperty({ description: 'Average rating' })
  averageRating: number;

  @ApiProperty({ description: 'Total ratings' })
  totalRatings: number;

  @ApiProperty({ description: 'Minimum price' })
  minPrice: number;

  @ApiProperty({ description: 'Maximum price' })
  maxPrice: number;

  @ApiProperty({
    description: 'Product images',
    type: [ProductImageResponseDto],
  })
  images: ProductImageResponseDto[];

  @ApiProperty({
    description: 'Product options',
    type: [ProductOptionResponseDto],
  })
  options: ProductOptionResponseDto[];

  @ApiProperty({
    description: 'Product variants',
    type: [ProductVariantResponseDto],
  })
  variants: ProductVariantResponseDto[];

  @ApiProperty({
    description: 'Category hierarchy from root to current',
    type: [CategoryBreadcrumbDto],
  })
  categoryHierarchy: CategoryBreadcrumbDto[];

  @ApiProperty({
    description: 'Allergen tags',
    type: [TagDto],
  })
  allergenTags: TagDto[];

  @ApiProperty({
    description: 'Diet tags',
    type: [TagDto],
  })
  dietTags: TagDto[];

  @ApiPropertyOptional({
    description: 'Nutrition information',
    type: NutritionInfoDto,
    nullable: true,
  })
  nutrition: NutritionInfoDto | null;

  @ApiProperty({
    description: 'Shop information',
    type: ShopInfoDto,
  })
  shop: ShopInfoDto;

  constructor(
    product: Product,
    options: {
      categoryName?: string;
      brandName?: string;
      servingUnit?: UnitInfo | null;
      variantUnitMap?: Map<string, UnitInfo>;
      categoryHierarchy?: Category[];
      shop: Shop;
      shopProvince?: string | null;
      allergenTags?: AllergenTag[];
      dietTags?: DietTag[];
      nutrition?: ProductNutrition | null;
    },
  ) {
    this.id = product.id;
    this.name = product.name;
    this.slug = product.slug;
    this.description = product.description;
    this.shortDescription = null; // Not in domain model yet
    this.categoryId = product.categoryId;
    this.categoryName = options.categoryName ?? null;
    this.brandId = product.brandId;
    this.brandName = options.brandName ?? null;
    this.thumbnailUrl = product.thumbnailUrl;
    this.viewCount = 0; // TODO: Add view count tracking
    this.soldCount = product.totalSold;
    this.averageRating = product.averageRating;
    this.totalRatings = product.totalRatings;
    this.minPrice = product.minPrice;
    this.maxPrice = product.maxPrice;

    this.images = ProductImageResponseDto.fromList(product.images);
    this.options = ProductOptionResponseDto.fromList(product.options);
    this.variants = ProductVariantResponseDto.fromList(
      product.variants,
      options.variantUnitMap,
    );

    this.categoryHierarchy = options.categoryHierarchy
      ? CategoryBreadcrumbDto.fromList(options.categoryHierarchy)
      : [];

    this.allergenTags = options.allergenTags
      ? options.allergenTags.map((t) => new TagDto(t))
      : [];

    this.dietTags = options.dietTags
      ? options.dietTags.map((t) => new TagDto(t))
      : [];

    this.nutrition = options.nutrition
      ? new NutritionInfoDto(
          options.nutrition,
          product.servingSize,
          options.servingUnit,
        )
      : null;

    this.shop = new ShopInfoDto(options.shop, options.shopProvince);
  }
}

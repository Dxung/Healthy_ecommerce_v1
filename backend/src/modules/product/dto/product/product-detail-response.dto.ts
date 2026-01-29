import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Product } from '../../models/product.model';
import { ProductStatus } from 'src/database/typeorm/entities/product/enums/product-status.enum';
import { ProductImageResponseDto } from './product-image-response.dto';
import { ProductOptionResponseDto } from './product-option-response.dto';
import {
  ProductVariantResponseDto,
  UnitInfo,
} from './product-variant-response.dto';

/**
 * Response DTO for full product details.
 */
export class ProductDetailResponseDto {
  @ApiProperty({ description: 'Product ID' })
  id: string;

  @ApiProperty({ description: 'Shop ID' })
  shopId: string;

  @ApiProperty({ description: 'Category ID' })
  categoryId: string;

  @ApiPropertyOptional({ description: 'Brand ID', nullable: true })
  brandId: string | null;

  @ApiProperty({ description: 'Product name' })
  name: string;

  @ApiProperty({ description: 'URL-friendly slug' })
  slug: string;

  @ApiPropertyOptional({ description: 'Product description', nullable: true })
  description: string | null;

  @ApiProperty({ description: 'Thumbnail URL' })
  thumbnailUrl: string;

  @ApiProperty({ description: 'Minimum price from variants' })
  minPrice: number;

  @ApiProperty({ description: 'Maximum price from variants' })
  maxPrice: number;

  @ApiProperty({ description: 'Total units sold' })
  soldCount: number;

  @ApiProperty({ description: 'Total stock across all variants' })
  totalStock: number;

  @ApiProperty({ description: 'View count' })
  viewCount: number;

  @ApiProperty({ description: 'Average rating (0-5)' })
  averageRating: number;

  @ApiProperty({ description: 'Total number of ratings' })
  totalRatings: number;

  @ApiProperty({ description: 'Whether officially approved' })
  isOfficialApproved: boolean;

  @ApiProperty({ description: 'Whether product is visible' })
  isVisible: boolean;

  @ApiPropertyOptional({
    description: 'Serving size (e.g., 100 for "per 100g")',
    nullable: true,
  })
  servingSize: number | null;

  @ApiPropertyOptional({
    description: 'Serving unit ID (e.g., g, ml)',
    nullable: true,
  })
  servingUnitId: string | null;

  @ApiPropertyOptional({
    description: 'Serving unit name (e.g., "gram", "milliliter")',
    nullable: true,
  })
  servingUnitName: string | null;

  @ApiPropertyOptional({
    description: 'Serving unit symbol (e.g., "g", "ml")',
    nullable: true,
  })
  servingUnitSymbol: string | null;

  @ApiProperty({ description: 'Product status', enum: ProductStatus })
  status: ProductStatus;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt: Date;

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

  @ApiPropertyOptional({ description: 'Category name' })
  categoryName?: string;

  @ApiPropertyOptional({ description: 'Brand name' })
  brandName?: string;

  constructor(
    product: Product,
    options?: {
      categoryName?: string;
      brandName?: string;
      servingUnit?: UnitInfo | null;
      variantUnitMap?: Map<string, UnitInfo>;
    },
  ) {
    this.id = product.id;
    this.shopId = product.shopId;
    this.categoryId = product.categoryId;
    this.brandId = product.brandId;
    this.name = product.name;
    this.slug = product.slug;
    this.description = product.description;
    this.thumbnailUrl = product.thumbnailUrl;
    this.minPrice = product.minPrice;
    this.maxPrice = product.maxPrice;
    this.soldCount = product.totalSold;
    this.totalStock = product.variants.reduce(
      (sum, v) => sum + v.stockQuantity,
      0,
    );
    this.viewCount = 0; // TODO: Add viewCount to product model when needed
    this.averageRating = product.averageRating;
    this.totalRatings = product.totalRatings;
    this.isOfficialApproved = product.isOfficialApproved;
    this.isVisible = product.isVisible;
    this.servingSize = product.servingSize;
    this.servingUnitId = product.servingUnitId;
    this.servingUnitName = options?.servingUnit?.name ?? null;
    this.servingUnitSymbol = options?.servingUnit?.symbol ?? null;
    this.status = product.status;
    this.createdAt = product.createdAt;
    this.updatedAt = product.updatedAt;

    this.images = ProductImageResponseDto.fromList(product.images);
    this.options = ProductOptionResponseDto.fromList(product.options);
    this.variants = ProductVariantResponseDto.fromList(
      product.variants,
      options?.variantUnitMap,
    );

    this.categoryName = options?.categoryName;
    this.brandName = options?.brandName;
  }
}

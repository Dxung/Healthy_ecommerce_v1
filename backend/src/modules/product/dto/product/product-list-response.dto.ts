import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Product } from '../../models/product.model';
import { ProductStatus } from 'src/database/typeorm/entities/product/enums/product-status.enum';

/**
 * Response DTO for product list items (simplified for listings).
 */
export class ProductListResponseDto {
  @ApiProperty({ description: 'Product ID' })
  id: string;

  @ApiProperty({ description: 'Shop ID' })
  shopId: string;

  @ApiProperty({ description: 'Product name' })
  name: string;

  @ApiProperty({ description: 'URL-friendly slug' })
  slug: string;

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

  @ApiProperty({ description: 'Number of variants' })
  variantCount: number;

  @ApiProperty({ description: 'Average rating (0-5)' })
  averageRating: number;

  @ApiProperty({ description: 'Total number of ratings' })
  totalRatings: number;

  @ApiProperty({ description: 'Whether officially approved (Chính hãng)' })
  isOfficialApproved: boolean;

  @ApiProperty({ description: 'Product status', enum: ProductStatus })
  status: ProductStatus;

  @ApiProperty({ description: 'Whether product is visible' })
  isVisible: boolean;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @ApiPropertyOptional({ description: 'Category name' })
  categoryName?: string;

  @ApiPropertyOptional({ description: 'Brand name' })
  brandName?: string;

  constructor(product: Product, categoryName?: string, brandName?: string) {
    this.id = product.id;
    this.shopId = product.shopId;
    this.name = product.name;
    this.slug = product.slug;
    this.thumbnailUrl = product.thumbnailUrl;
    this.minPrice = product.minPrice;
    this.maxPrice = product.maxPrice;
    this.soldCount = product.totalSold;
    this.totalStock = product.variants.reduce(
      (sum, v) => sum + v.stockQuantity,
      0,
    );
    this.variantCount = product.variants.length;
    this.averageRating = product.averageRating;
    this.totalRatings = product.totalRatings;
    this.isOfficialApproved = product.isOfficialApproved;
    this.status = product.status;
    this.isVisible = product.isVisible;
    this.createdAt = product.createdAt;
    this.categoryName = categoryName;
    this.brandName = brandName;
  }

  static fromList(
    products: Product[],
    categoryNames?: Map<string, string>,
    brandNames?: Map<string, string>,
  ): ProductListResponseDto[] {
    return products.map(
      (product) =>
        new ProductListResponseDto(
          product,
          categoryNames?.get(product.categoryId),
          product.brandId ? brandNames?.get(product.brandId) : undefined,
        ),
    );
  }
}

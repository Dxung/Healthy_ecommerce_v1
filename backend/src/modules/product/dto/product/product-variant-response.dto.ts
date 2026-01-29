import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductVariant } from '../../models/product-variant.model';

/**
 * Unit info for display purposes.
 */
export interface UnitInfo {
  id: string;
  name: string;
  symbol: string;
}

/**
 * Response DTO for product variant.
 */
export class ProductVariantResponseDto {
  @ApiProperty({ description: 'Variant ID' })
  id: string;

  @ApiPropertyOptional({ description: 'SKU code', nullable: true })
  sku: string | null;

  @ApiProperty({ description: 'Variant name' })
  name: string;

  @ApiProperty({ description: 'Price in VND' })
  price: number;

  @ApiPropertyOptional({
    description: 'Original price for discount display',
    nullable: true,
  })
  compareAtPrice: number | null;

  @ApiProperty({ description: 'Stock quantity' })
  stockQuantity: number;

  @ApiPropertyOptional({ description: 'Variant image URL', nullable: true })
  imageUrl: string | null;

  @ApiPropertyOptional({
    description: 'Selling unit ID (e.g., Box, Pack)',
    nullable: true,
  })
  sellingUnitId: string | null;

  @ApiPropertyOptional({
    description: 'Selling unit name (e.g., "Box", "Pack")',
    nullable: true,
  })
  sellingUnitName: string | null;

  @ApiPropertyOptional({
    description: 'Selling unit symbol (e.g., "Box", "Pack")',
    nullable: true,
  })
  sellingUnitSymbol: string | null;

  @ApiPropertyOptional({
    description: 'Unit quantity (e.g., 500 if 1 Box = 500g)',
    nullable: true,
  })
  unitQuantity: number | null;

  @ApiProperty({ description: 'Whether variant is active' })
  isActive: boolean;

  @ApiPropertyOptional({ description: 'Expiry date', nullable: true })
  expiryDate: string | null;

  @ApiProperty({ description: 'Whether variant is in stock' })
  isInStock: boolean;

  @ApiPropertyOptional({ description: 'Discount percentage if applicable' })
  discountPercentage?: number;

  @ApiProperty({
    description: 'Option value IDs for this variant',
    type: [String],
  })
  optionValueIds: string[];

  constructor(variant: ProductVariant, sellingUnit?: UnitInfo | null) {
    this.id = variant.id;
    this.sku = variant.sku;
    this.name = variant.name;
    this.price = variant.price;
    this.compareAtPrice = variant.compareAtPrice;
    this.stockQuantity = variant.stockQuantity;
    this.imageUrl = variant.imageUrl;
    this.sellingUnitId = variant.sellingUnitId;
    this.sellingUnitName = sellingUnit?.name ?? null;
    this.sellingUnitSymbol = sellingUnit?.symbol ?? null;
    this.unitQuantity = variant.unitQuantity;
    this.isActive = variant.isActive;
    this.expiryDate = variant.expiryDate
      ? variant.expiryDate.toISOString().split('T')[0]
      : null;
    this.isInStock = variant.isInStock();
    this.optionValueIds = variant.optionValueIds;

    if (variant.hasDiscount()) {
      this.discountPercentage = variant.getDiscountPercentage();
    }
  }

  static fromList(
    variants: ProductVariant[],
    unitMap?: Map<string, UnitInfo>,
  ): ProductVariantResponseDto[] {
    return variants.map((variant) => {
      const sellingUnit = variant.sellingUnitId
        ? unitMap?.get(variant.sellingUnitId)
        : null;
      return new ProductVariantResponseDto(variant, sellingUnit);
    });
  }
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  IsNumber,
  Min,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for product nutrition information.
 */
export class CreateProductNutritionDto {
  @ApiPropertyOptional({ description: 'Calories per serving (kcal)', example: 150 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  calories?: number;

  @ApiPropertyOptional({ description: 'Protein per serving (g)', example: 8 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  protein?: number;

  @ApiPropertyOptional({ description: 'Carbohydrates per serving (g)', example: 20 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  carbohydrates?: number;

  @ApiPropertyOptional({ description: 'Sugar per serving (g)', example: 12 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sugar?: number;

  @ApiPropertyOptional({ description: 'Total fat per serving (g)', example: 5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fat?: number;

  @ApiPropertyOptional({ description: 'Saturated fat per serving (g)', example: 2 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  saturatedFat?: number;

  @ApiPropertyOptional({ description: 'Fiber per serving (g)', example: 3 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fiber?: number;

  @ApiPropertyOptional({ description: 'Sodium per serving (mg)', example: 150 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sodium?: number;
}

/**
 * DTO for creating a product option.
 */
export class CreateProductOptionDto {
  @ApiProperty({ description: 'Option name (e.g., "Size", "Color")' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Option values (e.g., ["S", "M", "L"])',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  values: string[];
}

/**
 * DTO for creating a product variant.
 */
export class CreateProductVariantDto {
  @ApiPropertyOptional({ description: 'SKU code' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  sku?: string;

  @ApiProperty({ description: 'Variant name (e.g., "S - Red")' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Price in VND', example: 100000 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    description: 'Original price for discount display',
    example: 150000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  compareAtPrice?: number;

  @ApiProperty({ description: 'Stock quantity', example: 100 })
  @IsNumber()
  @Min(0)
  stockQuantity: number;

  @ApiProperty({ description: 'Variant image URL (required)' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  imageUrl: string;

  @ApiPropertyOptional({ description: 'Selling unit ID (e.g., Box, Pack)' })
  @IsOptional()
  @IsUUID()
  sellingUnitId?: string;

  @ApiPropertyOptional({
    description: 'Unit quantity (e.g., 500 if 1 Box = 500g)',
    example: 500,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  unitQuantity?: number;

  @ApiPropertyOptional({
    description: 'Expiry date (YYYY-MM-DD format)',
    example: '2025-12-31',
  })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiPropertyOptional({
    description: 'Option value indices (corresponds to options array order)',
    type: [Number],
    example: [0, 1],
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  optionValueIndices?: number[];
}

/**
 * DTO for creating a new product.
 */
export class CreateProductArgumentDto {
  @ApiProperty({ description: 'Category ID' })
  @IsNotEmpty()
  @IsUUID()
  categoryId: string;

  @ApiPropertyOptional({ description: 'Brand ID' })
  @IsOptional()
  @IsUUID()
  brandId?: string;

  @ApiProperty({ description: 'Product name', example: 'Sữa tươi Vinamilk' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'URL-friendly slug',
    example: 'sua-tuoi-vinamilk',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  slug: string;

  @ApiPropertyOptional({ description: 'Product description' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiProperty({
    description: 'Thumbnail URL',
    example: 'https://example.com/thumb.jpg',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  thumbnailUrl: string;

  @ApiPropertyOptional({
    description: 'Serving size (e.g., 100 for "per 100g")',
    example: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  servingSize?: number;

  @ApiPropertyOptional({ description: 'Serving unit ID (e.g., g, ml)' })
  @IsOptional()
  @IsUUID()
  servingUnitId?: string;

  @ApiPropertyOptional({
    description: 'Product options (e.g., Size, Color)',
    type: [CreateProductOptionDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductOptionDto)
  options?: CreateProductOptionDto[];

  @ApiProperty({
    description: 'Product variants (at least 1 required)',
    type: [CreateProductVariantDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => CreateProductVariantDto)
  variants: CreateProductVariantDto[];

  @ApiPropertyOptional({
    description: 'Product ingredients (list of ingredient names)',
    type: [String],
    example: ['Sữa tươi', 'Đường', 'Muối'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ingredients?: string[];

  @ApiPropertyOptional({
    description: 'Allergen tag IDs',
    type: [String],
    example: ['uuid-1', 'uuid-2'],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  allergenTagIds?: string[];

  @ApiPropertyOptional({
    description: 'Diet tag IDs',
    type: [String],
    example: ['uuid-1', 'uuid-2'],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  dietTagIds?: string[];

  @ApiPropertyOptional({
    description: 'Product nutrition information',
    type: CreateProductNutritionDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateProductNutritionDto)
  nutrition?: CreateProductNutritionDto;
}

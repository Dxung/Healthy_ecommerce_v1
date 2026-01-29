import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsNumber,
  Min,
  IsArray,
  IsUUID,
  IsDateString,
} from 'class-validator';

/**
 * DTO for adding a variant to an existing product.
 */
export class CreateVariantArgumentDto {
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
    description: 'Option value IDs for this variant',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  optionValueIds?: string[];
}

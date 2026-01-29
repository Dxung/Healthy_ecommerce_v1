import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  MaxLength,
  IsNumber,
  Min,
  IsBoolean,
  IsUUID,
  IsDateString,
} from 'class-validator';

/**
 * DTO for updating an existing variant.
 */
export class UpdateVariantArgumentDto {
  @ApiPropertyOptional({ description: 'SKU code' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  sku?: string;

  @ApiPropertyOptional({ description: 'Variant name' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ description: 'Price in VND' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ description: 'Original price for discount display' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  compareAtPrice?: number | null;

  @ApiPropertyOptional({ description: 'Stock quantity' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stockQuantity?: number;

  @ApiPropertyOptional({ description: 'Variant image URL' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Selling unit ID (e.g., Box, Pack)' })
  @IsOptional()
  @IsUUID()
  sellingUnitId?: string | null;

  @ApiPropertyOptional({
    description: 'Unit quantity (e.g., 500 if 1 Box = 500g)',
    example: 500,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  unitQuantity?: number | null;

  @ApiPropertyOptional({ description: 'Whether variant is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Expiry date (YYYY-MM-DD format)',
    example: '2025-12-31',
  })
  @IsOptional()
  @IsDateString()
  expiryDate?: string | null;
}

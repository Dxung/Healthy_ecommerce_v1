import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  IsBoolean,
  IsNumber,
  Min,
} from 'class-validator';

/**
 * DTO for updating an existing product.
 */
export class UpdateProductArgumentDto {
  @ApiPropertyOptional({ description: 'Category ID' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Brand ID (null to remove)' })
  @IsOptional()
  @IsUUID()
  brandId?: string | null;

  @ApiPropertyOptional({ description: 'Product name' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ description: 'URL-friendly slug' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  slug?: string;

  @ApiPropertyOptional({ description: 'Product description' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiPropertyOptional({ description: 'Thumbnail URL' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  thumbnailUrl?: string;

  @ApiPropertyOptional({ description: 'Whether product is visible to buyers' })
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;

  @ApiPropertyOptional({
    description: 'Serving size (e.g., 100 for "per 100g")',
    example: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  servingSize?: number | null;

  @ApiPropertyOptional({ description: 'Serving unit ID (e.g., g, ml)' })
  @IsOptional()
  @IsUUID()
  servingUnitId?: string | null;
}

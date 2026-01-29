import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsBoolean,
  MaxLength,
  IsInt,
  Min,
} from 'class-validator';

/**
 * DTO for updating an existing category.
 */
export class UpdateCategoryArgumentDto {
  @ApiPropertyOptional({
    description: 'Category name',
    example: 'Thực phẩm chức năng',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    description: 'URL-friendly slug',
    example: 'thuc-pham-chuc-nang',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  slug?: string;

  @ApiPropertyOptional({
    description: 'Category icon URL',
    example: 'https://example.com/icon.png',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  iconUrl?: string;

  @ApiPropertyOptional({
    description: 'Sort order for display',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({
    description: 'Whether category is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

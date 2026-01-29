import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  IsInt,
  Min,
} from 'class-validator';

/**
 * DTO for creating a new category.
 */
export class CreateCategoryArgumentDto {
  @ApiPropertyOptional({
    description: 'Parent category ID (null for root category)',
    example: '0192abc0-1234-7def-8901-234567890abc',
  })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiProperty({
    description: 'Category name',
    example: 'Thực phẩm chức năng',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'URL-friendly slug',
    example: 'thuc-pham-chuc-nang',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  slug: string;

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
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

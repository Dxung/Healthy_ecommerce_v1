import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * DTO for updating an allergen tag.
 */
export class UpdateAllergenTagArgumentDto {
  @ApiPropertyOptional({
    description: 'Allergen tag name',
    example: 'Tree Nuts',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'URL-friendly slug',
    example: 'tree-nuts',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  slug?: string;

  @ApiPropertyOptional({
    description: 'Allergen tag description',
    example: 'Contains tree nuts including almonds, cashews, walnuts',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string | null;

  @ApiPropertyOptional({
    description: 'Icon URL for the allergen tag',
    example: 'https://example.com/icons/nuts.png',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  iconUrl?: string | null;

  @ApiPropertyOptional({
    description: 'Whether the allergen tag is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

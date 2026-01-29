import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * DTO for updating a diet tag.
 */
export class UpdateDietTagArgumentDto {
  @ApiPropertyOptional({
    description: 'Diet tag name',
    example: 'Vegan',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'URL-friendly slug',
    example: 'vegan',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  slug?: string;

  @ApiPropertyOptional({
    description: 'Diet tag description',
    example: 'Contains no animal products or by-products',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string | null;

  @ApiPropertyOptional({
    description: 'Icon URL for the diet tag',
    example: 'https://example.com/icons/vegan.png',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  iconUrl?: string | null;

  @ApiPropertyOptional({
    description: 'Whether the diet tag is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

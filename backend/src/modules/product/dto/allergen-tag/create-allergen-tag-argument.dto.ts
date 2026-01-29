import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * DTO for creating a new allergen tag.
 */
export class CreateAllergenTagArgumentDto {
  @ApiProperty({
    description: 'Allergen tag name',
    example: 'Nuts',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'URL-friendly slug',
    example: 'nuts',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  slug: string;

  @ApiPropertyOptional({
    description: 'Allergen tag description',
    example: 'Contains tree nuts including almonds, cashews, walnuts',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Icon URL for the allergen tag',
    example: 'https://example.com/icons/nuts.png',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  iconUrl?: string;
}

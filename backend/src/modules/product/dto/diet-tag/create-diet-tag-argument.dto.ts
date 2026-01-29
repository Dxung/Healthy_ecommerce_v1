import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * DTO for creating a new diet tag.
 */
export class CreateDietTagArgumentDto {
  @ApiProperty({
    description: 'Diet tag name',
    example: 'Vegan',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'URL-friendly slug',
    example: 'vegan',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  slug: string;

  @ApiPropertyOptional({
    description: 'Diet tag description',
    example: 'Contains no animal products or by-products',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Icon URL for the diet tag',
    example: 'https://example.com/icons/vegan.png',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  iconUrl?: string;
}

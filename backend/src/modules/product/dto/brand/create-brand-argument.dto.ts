import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * DTO for creating a new brand.
 */
export class CreateBrandArgumentDto {
  @ApiProperty({
    description: 'Brand name',
    example: 'Vinamilk',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'URL-friendly slug',
    example: 'vinamilk',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  slug: string;

  @ApiPropertyOptional({
    description: 'Brand logo URL',
    example: 'https://example.com/logo.png',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  logoUrl?: string;

  @ApiPropertyOptional({
    description: 'Brand description',
    example: 'Leading dairy company in Vietnam',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}

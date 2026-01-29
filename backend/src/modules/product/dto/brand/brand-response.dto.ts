import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Brand } from '../../models/brand.model';

/**
 * Response DTO for brand information.
 */
export class BrandResponseDto {
  @ApiProperty({ description: 'Brand ID' })
  id: string;

  @ApiProperty({ description: 'Brand name' })
  name: string;

  @ApiProperty({ description: 'URL-friendly slug' })
  slug: string;

  @ApiPropertyOptional({ description: 'Brand logo URL', nullable: true })
  logoUrl: string | null;

  @ApiPropertyOptional({ description: 'Brand description', nullable: true })
  description: string | null;

  @ApiProperty({ description: 'Whether brand is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt: Date;

  constructor(brand: Brand) {
    this.id = brand.id;
    this.name = brand.name;
    this.slug = brand.slug;
    this.logoUrl = brand.logoUrl;
    this.description = brand.description;
    this.isActive = brand.isActive;
    this.createdAt = brand.createdAt;
    this.updatedAt = brand.updatedAt;
  }

  /**
   * Creates a list of BrandResponseDto from an array of Brand domain models.
   */
  static fromList(brands: Brand[]): BrandResponseDto[] {
    return brands.map((brand) => new BrandResponseDto(brand));
  }
}

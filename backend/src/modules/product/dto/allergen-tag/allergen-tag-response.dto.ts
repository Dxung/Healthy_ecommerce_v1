import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AllergenTag } from '../../models/allergen-tag.model';

/**
 * Response DTO for allergen tag information.
 */
export class AllergenTagResponseDto {
  @ApiProperty({ description: 'Allergen tag ID' })
  id: string;

  @ApiProperty({ description: 'Allergen tag name' })
  name: string;

  @ApiProperty({ description: 'URL-friendly slug' })
  slug: string;

  @ApiPropertyOptional({ description: 'Allergen tag description', nullable: true })
  description: string | null;

  @ApiPropertyOptional({ description: 'Icon URL', nullable: true })
  iconUrl: string | null;

  @ApiProperty({ description: 'Whether allergen tag is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt: Date;

  constructor(allergenTag: AllergenTag) {
    this.id = allergenTag.id;
    this.name = allergenTag.name;
    this.slug = allergenTag.slug;
    this.description = allergenTag.description;
    this.iconUrl = allergenTag.iconUrl;
    this.isActive = allergenTag.isActive;
    this.createdAt = allergenTag.createdAt;
    this.updatedAt = allergenTag.updatedAt;
  }

  /**
   * Creates a list of AllergenTagResponseDto from an array of AllergenTag domain models.
   */
  static fromList(allergenTags: AllergenTag[]): AllergenTagResponseDto[] {
    return allergenTags.map((tag) => new AllergenTagResponseDto(tag));
  }
}

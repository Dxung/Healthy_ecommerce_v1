import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DietTag } from '../../models/diet-tag.model';

/**
 * Response DTO for diet tag information.
 */
export class DietTagResponseDto {
  @ApiProperty({ description: 'Diet tag ID' })
  id: string;

  @ApiProperty({ description: 'Diet tag name' })
  name: string;

  @ApiProperty({ description: 'URL-friendly slug' })
  slug: string;

  @ApiPropertyOptional({ description: 'Diet tag description', nullable: true })
  description: string | null;

  @ApiPropertyOptional({ description: 'Icon URL', nullable: true })
  iconUrl: string | null;

  @ApiProperty({ description: 'Whether diet tag is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt: Date;

  constructor(dietTag: DietTag) {
    this.id = dietTag.id;
    this.name = dietTag.name;
    this.slug = dietTag.slug;
    this.description = dietTag.description;
    this.iconUrl = dietTag.iconUrl;
    this.isActive = dietTag.isActive;
    this.createdAt = dietTag.createdAt;
    this.updatedAt = dietTag.updatedAt;
  }

  /**
   * Creates a list of DietTagResponseDto from an array of DietTag domain models.
   */
  static fromList(dietTags: DietTag[]): DietTagResponseDto[] {
    return dietTags.map((tag) => new DietTagResponseDto(tag));
  }
}

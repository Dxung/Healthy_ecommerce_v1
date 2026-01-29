import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Category } from '../../models/category.model';

/**
 * Response DTO for category information.
 */
export class CategoryResponseDto {
  @ApiProperty({ description: 'Category ID' })
  id: string;

  @ApiProperty({ description: 'Parent category ID', nullable: true })
  parentId: string | null;

  @ApiProperty({ description: 'Category name' })
  name: string;

  @ApiProperty({ description: 'URL-friendly slug' })
  slug: string;

  @ApiProperty({ description: 'Category icon URL', nullable: true })
  iconUrl: string | null;

  @ApiProperty({ description: 'Category level (1-3)' })
  level: number;

  @ApiProperty({ description: 'Whether category is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Sort order for display' })
  sortOrder: number;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Child categories',
    type: () => [CategoryResponseDto],
  })
  children?: CategoryResponseDto[];

  constructor(category: Category) {
    this.id = category.id;
    this.parentId = category.parentId;
    this.name = category.name;
    this.slug = category.slug;
    this.iconUrl = category.iconUrl;
    this.level = category.level;
    this.isActive = category.isActive;
    this.sortOrder = category.sortOrder;
    this.createdAt = category.createdAt;
    this.updatedAt = category.updatedAt;

    if (category.children && category.children.length > 0) {
      this.children = category.children.map(
        (child) => new CategoryResponseDto(child),
      );
    }
  }

  /**
   * Creates a list of CategoryResponseDto from an array of Category domain models.
   */
  static fromList(categories: Category[]): CategoryResponseDto[] {
    return categories.map((category) => new CategoryResponseDto(category));
  }
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
  IsArray,
  MaxLength,
} from 'class-validator';

/**
 * DTO for updating an existing review.
 */
export class UpdateReviewArgumentDto {
  @ApiPropertyOptional({
    description: 'Rating from 1 to 5 stars',
    minimum: 1,
    maximum: 5,
    example: 4,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({
    description: 'Review text content',
    example: 'Cập nhật: Sản phẩm vẫn tốt sau 1 tuần sử dụng.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  content?: string;

  @ApiPropertyOptional({
    description: 'List of image URLs (replaces existing images)',
    type: [String],
    example: ['https://example.com/review-image2.jpg'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];
}

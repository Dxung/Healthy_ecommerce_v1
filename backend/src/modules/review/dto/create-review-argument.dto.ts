import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsInt,
  Min,
  Max,
  IsArray,
  MaxLength,
} from 'class-validator';

/**
 * DTO for creating a new review.
 */
export class CreateReviewArgumentDto {
  @ApiProperty({ description: 'Order item ID to review' })
  @IsNotEmpty()
  @IsUUID()
  orderItemId: string;

  @ApiProperty({
    description: 'Rating from 1 to 5 stars',
    minimum: 1,
    maximum: 5,
    example: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({
    description: 'Review text content',
    example: 'Sản phẩm rất tốt, đóng gói cẩn thận.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  content?: string;

  @ApiPropertyOptional({
    description: 'List of image URLs',
    type: [String],
    example: ['https://example.com/review-image1.jpg'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];
}

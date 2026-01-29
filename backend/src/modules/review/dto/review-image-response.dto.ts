import { ApiProperty } from '@nestjs/swagger';
import { ReviewImage } from '../models/review-image.model';

/**
 * Response DTO for review images.
 */
export class ReviewImageResponseDto {
  @ApiProperty({ description: 'Image ID' })
  id: string;

  @ApiProperty({ description: 'Image URL' })
  imageUrl: string;

  @ApiProperty({ description: 'Display order' })
  displayOrder: number;

  constructor(image: ReviewImage) {
    this.id = image.id;
    this.imageUrl = image.imageUrl;
    this.displayOrder = image.displayOrder;
  }

  static fromList(images: ReviewImage[]): ReviewImageResponseDto[] {
    return images
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((img) => new ReviewImageResponseDto(img));
  }
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Review } from '../models/review.model';
import { ReviewStatus } from 'src/database/typeorm/entities/product/enums/review-status.enum';
import { ReviewImageResponseDto } from './review-image-response.dto';
import { ReviewReplyResponseDto } from './review-reply-response.dto';

/**
 * Response DTO for a single review.
 */
export class ReviewResponseDto {
  @ApiProperty({ description: 'Review ID' })
  id: string;

  @ApiProperty({ description: 'Order item ID' })
  orderItemId: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Product ID' })
  productId: string;

  @ApiProperty({ description: 'Shop ID' })
  shopId: string;

  @ApiProperty({ description: 'Rating (1-5)', minimum: 1, maximum: 5 })
  rating: number;

  @ApiPropertyOptional({ description: 'Review content', nullable: true })
  content: string | null;

  @ApiProperty({ description: 'Review status', enum: ReviewStatus })
  status: ReviewStatus;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt: Date;

  @ApiProperty({
    description: 'Review images',
    type: [ReviewImageResponseDto],
  })
  images: ReviewImageResponseDto[];

  @ApiPropertyOptional({
    description: 'Shop reply',
    type: ReviewReplyResponseDto,
    nullable: true,
  })
  reply: ReviewReplyResponseDto | null;

  @ApiPropertyOptional({ description: 'User display name' })
  userName?: string;

  @ApiPropertyOptional({ description: 'User avatar URL' })
  userAvatarUrl?: string;

  @ApiPropertyOptional({ description: 'Product name' })
  productName?: string;

  @ApiPropertyOptional({ description: 'Product thumbnail URL' })
  productThumbnailUrl?: string;

  constructor(
    review: Review,
    options?: {
      userName?: string;
      userAvatarUrl?: string;
      productName?: string;
      productThumbnailUrl?: string;
    },
  ) {
    this.id = review.id;
    this.orderItemId = review.orderItemId;
    this.userId = review.userId;
    this.productId = review.productId;
    this.shopId = review.shopId;
    this.rating = review.rating;
    this.content = review.content;
    this.status = review.status;
    this.createdAt = review.createdAt;
    this.updatedAt = review.updatedAt;
    this.images = ReviewImageResponseDto.fromList(review.images);
    this.reply = review.reply ? new ReviewReplyResponseDto(review.reply) : null;

    // Use options if provided, otherwise use values from Review model
    this.userName = options?.userName;
    this.userAvatarUrl = options?.userAvatarUrl;
    this.productName = options?.productName ?? review.productName;
    this.productThumbnailUrl =
      options?.productThumbnailUrl ?? review.productThumbnailUrl ?? undefined;
  }

  static fromList(reviews: Review[]): ReviewResponseDto[] {
    return reviews.map((r) => new ReviewResponseDto(r));
  }
}

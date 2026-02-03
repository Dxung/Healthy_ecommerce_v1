import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReviewResponseDto } from './review-response.dto';
import { Review } from '../models/review.model';

/**
 * Response DTO for checking review status of an order item.
 */
export class CanReviewResponseDto {
  @ApiProperty({ description: 'Whether the user can create a new review' })
  canCreate: boolean;

  @ApiProperty({
    description: 'Whether the user can modify (update/delete) existing review',
  })
  canModify: boolean;

  @ApiPropertyOptional({
    description: 'Reason why the user cannot create/modify',
    nullable: true,
  })
  reason?: string;

  @ApiPropertyOptional({
    description: 'Existing review if already reviewed',
    type: ReviewResponseDto,
    nullable: true,
  })
  existingReview?: ReviewResponseDto | null;

  constructor(data: {
    canCreate: boolean;
    canModify: boolean;
    reason?: string;
    existingReview?: Review | null;
  }) {
    this.canCreate = data.canCreate;
    this.canModify = data.canModify;
    this.reason = data.reason;
    this.existingReview = data.existingReview
      ? new ReviewResponseDto(data.existingReview)
      : null;
  }
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Response DTO for checking if user can review an order item.
 */
export class CanReviewResponseDto {
  @ApiProperty({ description: 'Whether the user can review this order item' })
  canReview: boolean;

  @ApiPropertyOptional({
    description: 'Reason why the user cannot review (if canReview is false)',
    nullable: true,
  })
  reason?: string;

  constructor(canReview: boolean, reason?: string) {
    this.canReview = canReview;
    this.reason = reason;
  }
}

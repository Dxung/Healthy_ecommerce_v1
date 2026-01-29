import { ApiProperty } from '@nestjs/swagger';
import { ReviewReply } from '../models/review-reply.model';

/**
 * Response DTO for shop replies to reviews.
 */
export class ReviewReplyResponseDto {
  @ApiProperty({ description: 'Reply ID' })
  id: string;

  @ApiProperty({ description: 'Shop ID' })
  shopId: string;

  @ApiProperty({ description: 'Reply content' })
  content: string;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt: Date;

  constructor(reply: ReviewReply) {
    this.id = reply.id;
    this.shopId = reply.shopId;
    this.content = reply.content;
    this.createdAt = reply.createdAt;
    this.updatedAt = reply.updatedAt;
  }
}

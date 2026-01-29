import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * DTO for updating a shop reply to a review.
 */
export class UpdateReviewReplyArgumentDto {
  @ApiProperty({
    description: 'Updated reply text content',
    example: 'Cảm ơn bạn đã ủng hộ!',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  content: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * DTO for creating a shop reply to a review.
 */
export class CreateReviewReplyArgumentDto {
  @ApiProperty({
    description: 'Reply text content',
    example:
      'Cảm ơn bạn đã ủng hộ. Chúng tôi rất vui khi bạn hài lòng với sản phẩm!',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  content: string;
}

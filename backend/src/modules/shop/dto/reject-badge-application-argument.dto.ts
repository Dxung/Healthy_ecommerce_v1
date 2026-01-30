import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * DTO for rejecting a badge application
 */
export class RejectBadgeApplicationArgumentDto {
  @ApiProperty({
    description: 'Reason for rejection',
    example: 'Giấy tờ không hợp lệ hoặc đã hết hạn',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  reason: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * DTO for rejecting a shop registration request
 */
export class RejectRegistrationArgumentDto {
  @ApiProperty({
    description: 'Reason for rejecting the registration',
    example: 'Tài liệu kinh doanh không hợp lệ hoặc đã hết hạn.',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  reason: string;
}

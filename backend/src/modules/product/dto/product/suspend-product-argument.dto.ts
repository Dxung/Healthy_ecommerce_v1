import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * DTO for suspending a product (admin action).
 */
export class SuspendProductArgumentDto {
  @ApiProperty({
    description: 'Reason for suspension',
    example: 'Vi phạm chính sách về sản phẩm cấm',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  reason: string;
}

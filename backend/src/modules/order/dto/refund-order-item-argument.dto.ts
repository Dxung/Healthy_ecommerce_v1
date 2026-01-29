import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class RefundOrderItemArgumentDto {
  @ApiProperty({
    description: 'Reason for the refund',
    example: 'Product damaged during shipping',
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập lý do hoàn tiền.' })
  @MaxLength(500, { message: 'Lý do hoàn tiền không được quá 500 ký tự.' })
  reason: string;
}

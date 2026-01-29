import { IsInt, Min, Max } from 'class-validator';

export class TopupRequestDto {
  @IsInt({ message: 'Số tiền phải là số nguyên' })
  @Min(10000, { message: 'Số tiền nạp tối thiểu là 10,000 VND' })
  @Max(50000000, { message: 'Số tiền nạp tối đa là 50,000,000 VND' })
  amount: number;
}

import { IsInt, Min } from 'class-validator';

export class UpdateCartItemArgumentDto {
  @IsInt()
  @Min(1, { message: 'Số lượng phải lớn hơn 0' })
  quantity: number;
}

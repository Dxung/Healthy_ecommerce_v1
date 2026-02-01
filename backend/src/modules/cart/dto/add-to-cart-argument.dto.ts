import { IsUUID, IsInt, Min, IsBoolean, IsOptional } from 'class-validator';

export class AddToCartArgumentDto {
  @IsUUID()
  variantId: string;

  @IsInt()
  @Min(1, { message: 'Số lượng phải lớn hơn 0' })
  quantity: number;

  @IsOptional()
  @IsBoolean()
  selectItem?: boolean;
}

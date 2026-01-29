import { IsArray, IsUUID, ArrayMinSize } from 'class-validator';

export class RemoveCartItemsArgumentDto {
  @IsArray()
  @IsUUID('all', { each: true })
  @ArrayMinSize(1, { message: 'Vui lòng chọn ít nhất một sản phẩm để xóa' })
  cartItemIds: string[];
}

import {
  IsUUID,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  IsArray,
  ValidateNested,
  IsString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from 'src/database/typeorm/entities/order/enums/payment-method.enum';

export class ShopNoteDto {
  @IsUUID()
  shopId: string;

  @IsString()
  @MaxLength(500, { message: 'Ghi chú không được quá 500 ký tự' })
  note: string;
}

export class CreateOrderArgumentDto {
  @IsUUID()
  addressId: string;

  @IsEnum(PaymentMethod, { message: 'Phương thức thanh toán không hợp lệ' })
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsBoolean()
  useCoin?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  coinAmount?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShopNoteDto)
  shopNotes?: ShopNoteDto[];
}

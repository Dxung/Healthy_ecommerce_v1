import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CancelOrderArgumentDto {
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Lý do hủy không được quá 500 ký tự' })
  reason?: string;
}

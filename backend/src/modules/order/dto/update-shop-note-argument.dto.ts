import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateShopNoteArgumentDto {
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Ghi chú không được quá 500 ký tự' })
  note?: string | null;
}

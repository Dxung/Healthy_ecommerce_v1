import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class SuspendUserArgumentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason: string;
}

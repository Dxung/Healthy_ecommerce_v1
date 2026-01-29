import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePermissionArgumentDto {
  @ApiPropertyOptional({
    description: 'Permission description',
    example: 'Allows creating new products',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}

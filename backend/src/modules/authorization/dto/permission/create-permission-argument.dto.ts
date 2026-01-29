import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePermissionArgumentDto {
  @ApiProperty({
    description: 'Resource name (e.g., product, order, user)',
    example: 'product',
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  resource: string;

  @ApiProperty({
    description: 'Action name (e.g., create, read, update, delete)',
    example: 'create',
    maxLength: 50,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  action: string;

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

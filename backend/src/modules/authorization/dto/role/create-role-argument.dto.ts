import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateRoleArgumentDto {
  @ApiProperty({
    description: 'Role name (unique)',
    example: 'content_moderator',
    maxLength: 50,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  roleName: string;

  @ApiPropertyOptional({
    description: 'Role description',
    example: 'Can moderate user-generated content',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}

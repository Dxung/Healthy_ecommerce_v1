import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateRoleArgumentDto {
  @ApiPropertyOptional({
    description: 'Role name (unique)',
    example: 'content_moderator',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  roleName?: string;

  @ApiPropertyOptional({
    description: 'Role description',
    example: 'Can moderate user-generated content',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiPropertyOptional({
    description: 'Whether the role is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

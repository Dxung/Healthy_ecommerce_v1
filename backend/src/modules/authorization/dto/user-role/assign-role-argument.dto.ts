import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class AssignRoleArgumentDto {
  @ApiProperty({
    description: 'Role name to assign',
    example: 'content_moderator',
    maxLength: 50,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  roleName: string;

  @ApiPropertyOptional({
    description: 'Expiration date for the role assignment (ISO 8601 format)',
    example: '2025-12-31T23:59:59.000Z',
  })
  @IsOptional()
  @IsDateString()
  expireAt?: string;
}

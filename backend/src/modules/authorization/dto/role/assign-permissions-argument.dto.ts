import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class AssignPermissionsArgumentDto {
  @ApiProperty({
    description: 'Array of permission IDs to assign to the role',
    example: ['0192abc0-1234-7def-8901-234567890abc'],
    type: [String],
  })
  @IsArray()
  @IsUUID('all', { each: true })
  permissionIds: string[];

  @ApiPropertyOptional({
    description: 'Optional note about why these permissions were assigned',
    example: 'Needed for content moderation feature',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  note?: string;
}

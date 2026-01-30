import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { BadgeApplicationStatus } from 'src/database/typeorm/entities/shop/enums/badge-application-status.enum';
import { BadgeApplicationType } from 'src/database/typeorm/entities/shop/enums/badge-application-type.enum';

/**
 * Query DTO for listing badge applications (admin)
 */
export class BadgeApplicationListQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: BadgeApplicationStatus,
  })
  @IsOptional()
  @IsEnum(BadgeApplicationStatus)
  status?: BadgeApplicationStatus;

  @ApiPropertyOptional({
    description: 'Filter by application type',
    enum: BadgeApplicationType,
  })
  @IsOptional()
  @IsEnum(BadgeApplicationType)
  applicationType?: BadgeApplicationType;

  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

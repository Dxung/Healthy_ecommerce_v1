import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  Max,
  MaxLength,
} from 'class-validator';

/**
 * DTO for updating a badge's properties.
 */
export class UpdateBadgeArgumentDto {
  @ApiPropertyOptional({
    description: 'Badge display name',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Badge description',
  })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({
    description: 'Platform fee discount percentage (0-100)',
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  platformFeeDiscountPercent?: number | null;

  @ApiPropertyOptional({
    description: 'Search boost multiplier (e.g., 1.5 = 50% boost)',
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  searchBoostMultiplier?: number | null;

  @ApiPropertyOptional({
    description: 'Maximum product slots allowed',
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxProductSlots?: number;
}

import { ApiProperty } from '@nestjs/swagger';
import { ShopBadge } from '../models/shop-badge.model';
import { ShopBadgeCode } from 'src/database/typeorm/entities/shop/enums/shop-badge-code.enum';

/**
 * Response DTO for badge information.
 */
export class BadgeResponseDto {
  @ApiProperty({ description: 'Badge ID' })
  id: string;

  @ApiProperty({ enum: ShopBadgeCode, description: 'Badge code' })
  code: ShopBadgeCode;

  @ApiProperty({ description: 'Badge display name' })
  name: string;

  @ApiProperty({ description: 'Badge description', nullable: true })
  description: string | null;

  @ApiProperty({ description: 'Platform fee discount percentage', nullable: true })
  platformFeeDiscountPercent: number | null;

  @ApiProperty({ description: 'Search boost multiplier', nullable: true })
  searchBoostMultiplier: number | null;

  @ApiProperty({ description: 'Maximum product slots allowed' })
  maxProductSlots: number;

  @ApiProperty({ description: 'Whether badge is currently active' })
  isActive: boolean;

  @ApiProperty({ description: 'Number of requirements for this badge' })
  requirementsCount: number;

  constructor(badge: ShopBadge) {
    this.id = badge.id;
    this.code = badge.code;
    this.name = badge.name;
    this.description = badge.description;
    this.platformFeeDiscountPercent = badge.platformFeeDiscountPercent;
    this.searchBoostMultiplier = badge.searchBoostMultiplier;
    this.maxProductSlots = badge.maxProductSlots;
    this.isActive = badge.isActive;
    this.requirementsCount = badge.requirements?.length ?? 0;
  }
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ShopBadge } from '../models/shop-badge.model';
import { ShopBadgeAssignment } from '../models/shop-badge-assignment.model';
import { ShopBadgeCode } from 'src/database/typeorm/entities/shop/enums/shop-badge-code.enum';
import { ShopBadgeStatus } from 'src/database/typeorm/entities/shop/enums/shop-badge-status.enum';

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

  /**
   * Creates a response DTO from a shop badge assignment.
   */
  static fromBadgeAssignment(assignment: ShopBadgeAssignment): ShopBadgeAssignmentResponseDto {
    return ShopBadgeAssignmentResponseDto.fromDomain(assignment);
  }
}

/**
 * Response DTO for shop's badge assignment.
 */
export class ShopBadgeAssignmentResponseDto {
  @ApiProperty({ description: 'Badge assignment ID' })
  id: string;

  @ApiProperty({ description: 'Shop ID' })
  shopId: string;

  @ApiProperty({ enum: ShopBadgeCode, description: 'Badge code' })
  badgeCode: ShopBadgeCode;

  @ApiPropertyOptional({ description: 'Brand ID (for OFFICIAL badges)' })
  brandId: string | null;

  @ApiProperty({ enum: ShopBadgeStatus, description: 'Badge status' })
  status: ShopBadgeStatus;

  @ApiProperty({ description: 'Date when badge was granted' })
  grantedAt: Date;

  @ApiPropertyOptional({ description: 'Badge expiration date' })
  expiresAt: Date | null;

  @ApiPropertyOptional({ description: 'Date when badge was disabled' })
  disabledAt: Date | null;

  @ApiPropertyOptional({ description: 'Reason for disabling badge' })
  disabledReason: string | null;

  @ApiProperty({ description: 'Whether badge is currently active' })
  isActive: boolean;

  @ApiProperty({ description: 'Whether badge has expired' })
  isExpired: boolean;

  static fromDomain(assignment: ShopBadgeAssignment): ShopBadgeAssignmentResponseDto {
    return {
      id: assignment.id,
      shopId: assignment.shopId,
      badgeCode: assignment.badgeCode,
      brandId: assignment.brandId,
      status: assignment.status,
      grantedAt: assignment.grantedAt,
      expiresAt: assignment.expiresAt,
      disabledAt: assignment.disabledAt,
      disabledReason: assignment.disabledReason,
      isActive: assignment.isActive(),
      isExpired: assignment.isExpired(),
    };
  }
}

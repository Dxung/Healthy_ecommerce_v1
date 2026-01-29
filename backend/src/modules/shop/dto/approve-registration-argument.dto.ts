import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsEnum } from 'class-validator';

/**
 * Badge types that can be granted during approval
 */
export enum ApproveBadgeType {
  APPROVED = 'approved',
  OFFICIAL = 'official',
}

/**
 * DTO for approving a shop registration request
 * Admin can approve shop only or approve shop + badge
 */
export class ApproveRegistrationArgumentDto {
  @ApiPropertyOptional({
    description:
      'If true, approve shop only without any badge. Documents will be ignored.',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  approveShopOnly?: boolean;

  @ApiPropertyOptional({
    description:
      'Badge type to grant. Only used if approveShopOnly is false. "approved" for business documents, "official" for brand authorization.',
    enum: ApproveBadgeType,
    example: ApproveBadgeType.APPROVED,
  })
  @IsOptional()
  @IsEnum(ApproveBadgeType)
  approveBadge?: ApproveBadgeType;
}

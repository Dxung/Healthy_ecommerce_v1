import { ApiProperty } from '@nestjs/swagger';
import { ShopBadge } from '../models/shop-badge.model';
import { BadgeRequirement } from '../models/badge-requirement.model';
import { ShopBadgeCode } from 'src/database/typeorm/entities/shop/enums/shop-badge-code.enum';
import { RequirementType } from 'src/database/typeorm/entities/shop/enums/requirement-type.enum';
import { ShopAttributeCode } from 'src/database/typeorm/entities/shop/enums/shop-attribute-code.enum';
import { ComparisonOperator } from 'src/database/typeorm/entities/shop/enums/comparison-operator.enum';

/**
 * Response DTO for a single badge requirement.
 */
export class BadgeRequirementResponseDto {
  @ApiProperty({ description: 'Requirement ID' })
  id: string;

  @ApiProperty({ enum: RequirementType, description: 'Type of requirement' })
  requirementType: RequirementType;

  // Document requirement fields
  @ApiProperty({ description: 'Document type ID', nullable: true })
  documentTypeId: string | null;

  @ApiProperty({ description: 'Document type name', nullable: true })
  documentTypeName: string | null;

  // Attribute requirement fields
  @ApiProperty({ enum: ShopAttributeCode, description: 'Attribute code', nullable: true })
  attributeCode: ShopAttributeCode | null;

  @ApiProperty({ enum: ComparisonOperator, description: 'Comparison operator', nullable: true })
  operator: ComparisonOperator | null;

  @ApiProperty({ description: 'Attribute value', nullable: true })
  attributeValue: number | null;

  @ApiProperty({ description: 'Whether this requirement is required' })
  isRequired: boolean;

  @ApiProperty({ description: 'Whether this requirement is active' })
  isActive: boolean;

  constructor(requirement: BadgeRequirement) {
    this.id = requirement.id;
    this.requirementType = requirement.requirementType;
    this.documentTypeId = requirement.documentTypeId;
    this.documentTypeName = requirement.documentType?.name ?? null;
    this.attributeCode = requirement.attributeCode;
    this.operator = requirement.operator;
    this.attributeValue = requirement.attributeValue;
    this.isRequired = requirement.isRequired;
    this.isActive = requirement.isActive;
  }
}

/**
 * Response DTO for badge with full details including requirements.
 */
export class BadgeDetailResponseDto {
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

  @ApiProperty({ description: 'Badge requirements', type: [BadgeRequirementResponseDto] })
  requirements: BadgeRequirementResponseDto[];

  constructor(badge: ShopBadge) {
    this.id = badge.id;
    this.code = badge.code;
    this.name = badge.name;
    this.description = badge.description;
    this.platformFeeDiscountPercent = badge.platformFeeDiscountPercent;
    this.searchBoostMultiplier = badge.searchBoostMultiplier;
    this.maxProductSlots = badge.maxProductSlots;
    this.isActive = badge.isActive;
    this.requirements = (badge.requirements ?? []).map(
      (req) => new BadgeRequirementResponseDto(req),
    );
  }
}

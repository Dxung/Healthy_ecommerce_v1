import { ApiProperty } from '@nestjs/swagger';
import { BrandDocumentRequirement } from '../models/brand-document-requirement.model';

/**
 * Response DTO for document requirement (Verified badge)
 */
export class VerifiedDocumentRequirementResponseDto {
  @ApiProperty({ description: 'Document type ID' })
  documentTypeId: string;

  @ApiProperty({ description: 'Document type name' })
  name: string;

  @ApiProperty({ description: 'Document type description' })
  description: string;

  @ApiProperty({ description: 'Whether document is required' })
  isRequired: boolean;
}

/**
 * Response DTO for brand document requirement (Official badge)
 */
export class BrandDocumentRequirementResponseDto {
  @ApiProperty({ description: 'Requirement ID' })
  id: string;

  @ApiProperty({ description: 'Brand ID' })
  brandId: string;

  @ApiProperty({ description: 'Document type ID' })
  documentTypeId: string;

  @ApiProperty({ description: 'Whether requirement is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Created date' })
  createdAt: Date;

  static fromDomain(
    req: BrandDocumentRequirement,
  ): BrandDocumentRequirementResponseDto {
    return {
      id: req.id,
      brandId: req.brandId,
      documentTypeId: req.documentTypeId,
      isActive: req.isActive,
      createdAt: req.createdAt,
    };
  }
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BadgeApplication, BadgeApplicationDocument } from '../models/badge-application.model';
import { BadgeApplicationStatus } from 'src/database/typeorm/entities/shop/enums/badge-application-status.enum';
import { BadgeApplicationType } from 'src/database/typeorm/entities/shop/enums/badge-application-type.enum';

/**
 * Response DTO for badge application document
 */
export class BadgeApplicationDocumentResponseDto {
  @ApiProperty({ description: 'Document ID' })
  id: string;

  @ApiProperty({ description: 'Document type ID' })
  documentTypeId: string;

  @ApiProperty({ description: 'Document image URL' })
  imageUrl: string;

  @ApiProperty({ description: 'Document expiration date' })
  expiresAt: Date;

  @ApiProperty({ description: 'Document created date' })
  createdAt: Date;

  static fromDomain(doc: BadgeApplicationDocument): BadgeApplicationDocumentResponseDto {
    return {
      id: doc.id,
      documentTypeId: doc.documentTypeId,
      imageUrl: doc.imageUrl,
      expiresAt: doc.expiresAt,
      createdAt: doc.createdAt,
    };
  }
}

/**
 * Response DTO for badge application
 */
export class BadgeApplicationResponseDto {
  @ApiProperty({ description: 'Application ID' })
  id: string;

  @ApiProperty({ description: 'Shop ID' })
  shopId: string;

  @ApiProperty({
    description: 'Application type',
    enum: BadgeApplicationType,
  })
  applicationType: BadgeApplicationType;

  @ApiPropertyOptional({ description: 'Brand ID (for official applications)' })
  brandId: string | null;

  @ApiProperty({
    description: 'Application status',
    enum: BadgeApplicationStatus,
  })
  status: BadgeApplicationStatus;

  @ApiPropertyOptional({ description: 'Rejection reason (if rejected)' })
  rejectionReason: string | null;

  @ApiPropertyOptional({ description: 'Reviewer ID' })
  reviewedBy: string | null;

  @ApiPropertyOptional({ description: 'Review date' })
  reviewedAt: Date | null;

  @ApiProperty({ description: 'Application created date' })
  createdAt: Date;

  @ApiProperty({ description: 'Application last updated date' })
  updatedAt: Date;

  @ApiProperty({
    description: 'Documents submitted with application',
    type: [BadgeApplicationDocumentResponseDto],
  })
  documents: BadgeApplicationDocumentResponseDto[];

  static fromDomain(app: BadgeApplication): BadgeApplicationResponseDto {
    return {
      id: app.id,
      shopId: app.shopId,
      applicationType: app.applicationType,
      brandId: app.brandId,
      status: app.status,
      rejectionReason: app.rejectionReason,
      reviewedBy: app.reviewedBy,
      reviewedAt: app.reviewedAt,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
      documents: app.documents.map((doc) => BadgeApplicationDocumentResponseDto.fromDomain(doc)),
    };
  }
}

/**
 * Response DTO for badge application list item (summary)
 */
export class BadgeApplicationListItemDto {
  @ApiProperty({ description: 'Application ID' })
  id: string;

  @ApiProperty({ description: 'Shop ID' })
  shopId: string;

  @ApiProperty({
    description: 'Application type',
    enum: BadgeApplicationType,
  })
  applicationType: BadgeApplicationType;

  @ApiPropertyOptional({ description: 'Brand ID (for official applications)' })
  brandId: string | null;

  @ApiProperty({
    description: 'Application status',
    enum: BadgeApplicationStatus,
  })
  status: BadgeApplicationStatus;

  @ApiProperty({ description: 'Application created date' })
  createdAt: Date;

  static fromDomain(app: BadgeApplication): BadgeApplicationListItemDto {
    return {
      id: app.id,
      shopId: app.shopId,
      applicationType: app.applicationType,
      brandId: app.brandId,
      status: app.status,
      createdAt: app.createdAt,
    };
  }
}

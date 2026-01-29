import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentType } from '../models/document-type.model';

/**
 * Response DTO for document type information.
 */
export class DocumentTypeResponseDto {
  @ApiProperty({ description: 'Document type ID' })
  id: string;

  @ApiProperty({ description: 'Document type name' })
  name: string;

  @ApiProperty({ description: 'Document type description', nullable: true })
  description: string | null;

  @ApiProperty({ description: 'Sample image URL', nullable: true })
  sampleImageUrl: string | null;

  @ApiProperty({ description: 'Whether document type is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Badge names that require this document type',
    type: [String],
  })
  appliedBadges?: string[];

  constructor(documentType: DocumentType, appliedBadges?: string[]) {
    this.id = documentType.id;
    this.name = documentType.name;
    this.description = documentType.description;
    this.sampleImageUrl = documentType.sampleImageUrl;
    this.isActive = documentType.isActive;
    this.createdAt = documentType.createdAt;
    this.updatedAt = documentType.updatedAt;
    this.appliedBadges = appliedBadges;
  }
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ShopRegistrationRequest } from '../models/shop-registration-request.model';
import { ShopRegistrationStatus } from 'src/database/typeorm/entities/shop/enums/shop-registration-status.enum';

/**
 * Response DTO for checking own registration status
 */
export class RegistrationStatusResponseDto {
  @ApiProperty({
    description: 'Registration ID',
    example: '01935c6d-7890-7a5e-a5d3-6f1234567890',
  })
  id: string;

  @ApiProperty({
    description: 'Shop name',
    example: 'Healthy Foods Store',
  })
  name: string;

  @ApiProperty({
    description: 'Shop URL slug',
    example: 'healthy-foods-store',
  })
  slug: string;

  @ApiProperty({
    description: 'Registration status',
    enum: ShopRegistrationStatus,
    example: ShopRegistrationStatus.PENDING,
  })
  status: ShopRegistrationStatus;

  @ApiPropertyOptional({
    description: 'Rejection reason (only if rejected)',
    example: 'Tài liệu kinh doanh không hợp lệ.',
    nullable: true,
  })
  rejectionReason: string | null;

  @ApiPropertyOptional({
    description: 'Requested brand ID for official badge',
    example: '01935c6d-7890-7a5e-a5d3-6f1234567890',
    nullable: true,
  })
  requestedBrandId: string | null;

  @ApiProperty({
    description: 'Number of business documents submitted',
    example: 2,
  })
  documentsCount: number;

  @ApiProperty({
    description: 'Number of brand documents submitted',
    example: 1,
  })
  brandDocumentsCount: number;

  @ApiProperty({
    description: 'Registration submission date',
    example: '2026-01-15T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'Review date (if reviewed)',
    example: '2026-01-16T14:30:00.000Z',
    nullable: true,
  })
  reviewedAt: Date | null;

  constructor(registration: ShopRegistrationRequest) {
    this.id = registration.id;
    this.name = registration.name;
    this.slug = registration.slug;
    this.status = registration.status;
    this.rejectionReason = registration.rejectionReason;
    this.requestedBrandId = registration.requestedBrandId;
    this.documentsCount = registration.documents.length;
    this.brandDocumentsCount = registration.brandDocuments.length;
    this.createdAt = registration.createdAt;
    this.reviewedAt = registration.reviewedAt;
  }
}

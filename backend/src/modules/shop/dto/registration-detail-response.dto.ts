import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ShopRegistrationRequest,
  ShopRegistrationDocument,
  ShopRegistrationBrandDocument,
} from '../models/shop-registration-request.model';
import { ShopRegistrationStatus } from 'src/database/typeorm/entities/shop/enums/shop-registration-status.enum';

/**
 * Document info in registration detail response
 */
export class RegistrationDocumentResponseDto {
  @ApiProperty({
    description: 'Document ID',
    example: '01935c6d-7890-7a5e-a5d3-6f1234567890',
  })
  id: string;

  @ApiProperty({
    description: 'Document type ID',
    example: '01935c6d-7890-7a5e-a5d3-6f1234567890',
  })
  documentTypeId: string;

  @ApiProperty({
    description: 'Document image URL',
    example: 'https://storage.example.com/documents/business-license.jpg',
  })
  imageUrl: string;

  @ApiPropertyOptional({
    description: 'Document expiration date',
    example: '2027-12-31T00:00:00.000Z',
    nullable: true,
  })
  expiresAt: Date | null;

  @ApiProperty({
    description: 'Upload date',
    example: '2026-01-15T10:00:00.000Z',
  })
  createdAt: Date;

  constructor(doc: ShopRegistrationDocument | ShopRegistrationBrandDocument) {
    this.id = doc.id;
    this.documentTypeId = doc.documentTypeId;
    this.imageUrl = doc.imageUrl;
    this.expiresAt = doc.expiresAt;
    this.createdAt = doc.createdAt;
  }
}

/**
 * Response DTO for admin viewing registration details
 */
export class RegistrationDetailResponseDto {
  @ApiProperty({
    description: 'Registration ID',
    example: '01935c6d-7890-7a5e-a5d3-6f1234567890',
  })
  id: string;

  @ApiProperty({
    description: 'User ID who submitted the registration',
    example: '01935c6d-7890-7a5e-a5d3-6f1234567890',
  })
  userId: string;

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

  @ApiPropertyOptional({
    description: 'Shop logo URL',
    example: 'https://storage.example.com/logos/shop-logo.jpg',
    nullable: true,
  })
  logoUrl: string | null;

  @ApiPropertyOptional({
    description: 'Shop cover image URL',
    example: 'https://storage.example.com/covers/shop-cover.jpg',
    nullable: true,
  })
  coverUrl: string | null;

  @ApiProperty({
    description: 'Contact phone number',
    example: '+84912345678',
  })
  phone: string;

  @ApiProperty({
    description: 'Contact email',
    example: 'shop@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Detailed address line',
    example: '123 Đường ABC',
  })
  addressLine: string;

  @ApiProperty({
    description: 'Ward ID',
    example: '00001',
  })
  wardId: string;

  @ApiProperty({
    description: 'Ward name',
    example: 'Phường Bến Nghé',
  })
  wardName: string;

  @ApiProperty({
    description: 'District ID',
    example: '001',
  })
  districtId: string;

  @ApiProperty({
    description: 'District name',
    example: 'Quận 1',
  })
  districtName: string;

  @ApiProperty({
    description: 'Province ID',
    example: '01',
  })
  provinceId: string;

  @ApiProperty({
    description: 'Province name',
    example: 'Thành phố Hồ Chí Minh',
  })
  provinceName: string;

  @ApiPropertyOptional({
    description: 'Requested brand ID for official badge',
    example: '01935c6d-7890-7a5e-a5d3-6f1234567890',
    nullable: true,
  })
  requestedBrandId: string | null;

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
    description: 'Admin ID who reviewed the registration',
    example: '01935c6d-7890-7a5e-a5d3-6f1234567890',
    nullable: true,
  })
  reviewedBy: string | null;

  @ApiPropertyOptional({
    description: 'Review date',
    example: '2026-01-16T14:30:00.000Z',
    nullable: true,
  })
  reviewedAt: Date | null;

  @ApiProperty({
    description: 'Registration submission date',
    example: '2026-01-15T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2026-01-15T10:00:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Business documents for approved badge',
    type: [RegistrationDocumentResponseDto],
  })
  documents: RegistrationDocumentResponseDto[];

  @ApiProperty({
    description: 'Brand documents for official badge',
    type: [RegistrationDocumentResponseDto],
  })
  brandDocuments: RegistrationDocumentResponseDto[];

  constructor(
    registration: ShopRegistrationRequest,
    locationNames: {
      wardName: string;
      districtName: string;
      provinceName: string;
    },
  ) {
    this.id = registration.id;
    this.userId = registration.userId;
    this.name = registration.name;
    this.slug = registration.slug;
    this.logoUrl = registration.logoUrl;
    this.coverUrl = registration.coverUrl;
    this.phone = registration.phone;
    this.email = registration.email;
    this.addressLine = registration.addressLine;
    this.wardId = registration.wardId;
    this.wardName = locationNames.wardName;
    this.districtId = registration.districtId;
    this.districtName = locationNames.districtName;
    this.provinceId = registration.provinceId;
    this.provinceName = locationNames.provinceName;
    this.requestedBrandId = registration.requestedBrandId;
    this.status = registration.status;
    this.rejectionReason = registration.rejectionReason;
    this.reviewedBy = registration.reviewedBy;
    this.reviewedAt = registration.reviewedAt;
    this.createdAt = registration.createdAt;
    this.updatedAt = registration.updatedAt;
    this.documents = registration.documents.map(
      (doc) => new RegistrationDocumentResponseDto(doc),
    );
    this.brandDocuments = registration.brandDocuments.map(
      (doc) => new RegistrationDocumentResponseDto(doc),
    );
  }
}

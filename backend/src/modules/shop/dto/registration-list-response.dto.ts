import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ShopRegistrationRequest } from '../models/shop-registration-request.model';
import { ShopRegistrationStatus } from 'src/database/typeorm/entities/shop/enums/shop-registration-status.enum';

/**
 * Response DTO for admin listing registrations (summary view)
 */
export class RegistrationListResponseDto {
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
    description: 'Registration status',
    enum: ShopRegistrationStatus,
    example: ShopRegistrationStatus.PENDING,
  })
  status: ShopRegistrationStatus;

  @ApiPropertyOptional({
    description: 'Requested brand ID for official badge',
    example: '01935c6d-7890-7a5e-a5d3-6f1234567890',
    nullable: true,
  })
  requestedBrandId: string | null;

  @ApiProperty({
    description: 'Has business documents for approved badge',
    example: true,
  })
  hasDocuments: boolean;

  @ApiProperty({
    description: 'Has brand documents for official badge',
    example: false,
  })
  hasBrandDocuments: boolean;

  @ApiProperty({
    description: 'Registration submission date',
    example: '2026-01-15T10:00:00.000Z',
  })
  createdAt: Date;

  constructor(registration: ShopRegistrationRequest) {
    this.id = registration.id;
    this.userId = registration.userId;
    this.name = registration.name;
    this.slug = registration.slug;
    this.phone = registration.phone;
    this.email = registration.email;
    this.status = registration.status;
    this.requestedBrandId = registration.requestedBrandId;
    this.hasDocuments = registration.documents.length > 0;
    this.hasBrandDocuments = registration.brandDocuments.length > 0;
    this.createdAt = registration.createdAt;
  }
}

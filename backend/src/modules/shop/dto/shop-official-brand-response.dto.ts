import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ShopOfficialBrand } from '../models/shop-official-brand.model';

/**
 * Response DTO for shop official brand
 */
export class ShopOfficialBrandResponseDto {
  @ApiProperty({ description: 'Record ID' })
  id: string;

  @ApiProperty({ description: 'Shop ID' })
  shopId: string;

  @ApiProperty({ description: 'Brand ID' })
  brandId: string;

  @ApiPropertyOptional({
    description: 'Application ID that granted this status',
  })
  applicationId: string | null;

  @ApiProperty({ description: 'Date when official status was granted' })
  grantedAt: Date;

  @ApiProperty({ description: 'Expiration date of official status' })
  expiresAt: Date;

  @ApiPropertyOptional({ description: 'Date when official status was revoked' })
  revokedAt: Date | null;

  @ApiPropertyOptional({ description: 'Reason for revocation' })
  revokedReason: string | null;

  @ApiProperty({
    description: 'Whether the official status is currently active',
  })
  isActive: boolean;

  @ApiProperty({ description: 'Whether the official status has expired' })
  isExpired: boolean;

  static fromDomain(brand: ShopOfficialBrand): ShopOfficialBrandResponseDto {
    return {
      id: brand.id,
      shopId: brand.shopId,
      brandId: brand.brandId,
      applicationId: brand.applicationId,
      grantedAt: brand.grantedAt,
      expiresAt: brand.expiresAt,
      revokedAt: brand.revokedAt,
      revokedReason: brand.revokedReason,
      isActive: brand.isActive(),
      isExpired: brand.isExpired(),
    };
  }
}

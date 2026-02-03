import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  Matches,
  IsOptional,
  IsEmail,
  IsUUID,
  IsDateString,
} from 'class-validator';

/**
 * DTO for a document in badge application request
 */
export class BadgeApplicationDocumentDto {
  @ApiProperty({
    description: 'Document type ID',
    example: '01935c6d-7890-7a5e-a5d3-6f1234567890',
  })
  @IsNotEmpty()
  @IsUUID()
  documentTypeId: string;

  @ApiProperty({
    description: 'URL of the uploaded document image',
    example: 'https://storage.example.com/documents/business-license.jpg',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  imageUrl: string;

  @ApiPropertyOptional({
    description:
      'Document expiration date (ISO 8601 format). Null or omitted for permanent documents with no expiry.',
    example: '2027-12-31',
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string | null;
}

/**
 * DTO for single-step shop registration (no admin approval required)
 */
export class RegisterShopArgumentDto {
  @ApiProperty({
    description: 'Shop name (must be unique)',
    example: 'Healthy Foods Store',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description:
      'Contact phone number (Vietnamese format: +84xxxxxxxxx). Required only if user does not have a phone number yet.',
    example: '+84912345678',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\+84\d{9}$/, {
    message: 'Chỉ hỗ trợ số điện thoại Việt Nam (+84xxxxxxxxx)',
  })
  phone?: string;

  @ApiPropertyOptional({
    description:
      'Firebase OTP token for phone verification. Required only if user does not have a phone number yet.',
    example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsOptional()
  @IsString()
  firebaseOtpToken?: string;

  @ApiProperty({
    description: 'Contact email address',
    example: 'shop@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({
    description: 'Province ID',
    example: '01',
  })
  @IsNotEmpty()
  @IsString()
  provinceId: string;

  @ApiProperty({
    description: 'District ID',
    example: '001',
  })
  @IsNotEmpty()
  @IsString()
  districtId: string;

  @ApiProperty({
    description: 'Ward ID',
    example: '00001',
  })
  @IsNotEmpty()
  @IsString()
  wardId: string;

  @ApiProperty({
    description: 'Detailed address line',
    example: '123 Đường ABC',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  addressLine: string;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  Matches,
  IsOptional,
  IsEmail,
  IsArray,
  ValidateNested,
  IsUUID,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for a document in registration request
 */
export class RegistrationDocumentDto {
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
    description: 'Document expiration date (ISO 8601 format)',
    example: '2027-12-31',
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

/**
 * DTO for registering a new shop
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

  @ApiProperty({
    description: 'Contact phone number (Vietnamese format: +84xxxxxxxxx)',
    example: '+84912345678',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\+84\d{9}$/, {
    message: 'Chỉ hỗ trợ số điện thoại Việt Nam (+84xxxxxxxxx)',
  })
  phone: string;

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

  @ApiPropertyOptional({
    description: 'Brand ID to apply for official badge (optional)',
    example: '01935c6d-7890-7a5e-a5d3-6f1234567890',
  })
  @IsOptional()
  @IsUUID()
  requestedBrandId?: string;

  @ApiPropertyOptional({
    description: 'Business documents for approved badge application',
    type: [RegistrationDocumentDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RegistrationDocumentDto)
  documents?: RegistrationDocumentDto[];

  @ApiPropertyOptional({
    description: 'Brand authorization documents for official badge application',
    type: [RegistrationDocumentDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RegistrationDocumentDto)
  brandDocuments?: RegistrationDocumentDto[];
}

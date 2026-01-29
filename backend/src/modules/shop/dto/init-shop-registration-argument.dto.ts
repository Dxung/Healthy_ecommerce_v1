import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  Matches,
  IsEmail,
  IsOptional,
} from 'class-validator';

/**
 * DTO for initializing shop registration (Phase 1)
 * Verifies basic info and phone via Firebase OTP
 */
export class InitShopRegistrationArgumentDto {
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
    description:
      'Firebase OTP token for phone verification. Required only if user does not have a phone number yet.',
    example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsOptional()
  @IsString()
  firebaseOtpToken?: string;
}

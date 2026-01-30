import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, IsOptional, IsUUID, IsDateString } from 'class-validator';

/**
 * DTO for a document in registration request (legacy 2-phase flow)
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

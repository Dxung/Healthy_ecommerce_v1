import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RegistrationDocumentDto } from './register-shop-argument.dto';

/**
 * DTO for completing shop registration (Phase 2)
 * Submits badge choice and documents with the token from Phase 1
 */
export class CompleteShopRegistrationArgumentDto {
  @ApiProperty({
    description: 'Internal registration token from Phase 1',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsNotEmpty()
  @IsString()
  token: string;

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

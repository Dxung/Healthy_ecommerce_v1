import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * DTO for creating a new document type.
 */
export class CreateDocumentTypeArgumentDto {
  @ApiProperty({
    description: 'Document type name',
    example: 'Giấy phép kinh doanh',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Document type description',
    example: 'Giấy phép kinh doanh do cơ quan nhà nước cấp',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Sample image URL for reference',
    example: 'https://example.com/sample.jpg',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  sampleImageUrl?: string;
}

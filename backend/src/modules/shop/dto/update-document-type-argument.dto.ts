import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * DTO for updating a document type.
 */
export class UpdateDocumentTypeArgumentDto {
  @ApiPropertyOptional({
    description: 'Document type name',
    example: 'Giấy phép kinh doanh',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    description: 'Document type description',
    example: 'Giấy phép kinh doanh do cơ quan nhà nước cấp',
  })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({
    description: 'Sample image URL for reference',
    example: 'https://example.com/sample.jpg',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  sampleImageUrl?: string | null;
}

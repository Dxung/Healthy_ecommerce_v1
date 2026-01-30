import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

/**
 * DTO for adding a document requirement to a brand
 */
export class AddBrandRequirementArgumentDto {
  @ApiProperty({
    description: 'Document type ID to require for this brand',
    example: '01935c6d-7890-7a5e-a5d3-6f1234567890',
  })
  @IsNotEmpty()
  @IsUUID()
  documentTypeId: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsArray, ValidateNested, ArrayMinSize, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { BadgeApplicationDocumentDto } from './register-shop-argument.dto';

/**
 * DTO for applying for Official badge for a specific brand
 */
export class ApplyOfficialBadgeArgumentDto {
  @ApiProperty({
    description: 'Brand ID to apply for official status',
    example: '01935c6d-7890-7a5e-a5d3-6f1234567890',
  })
  @IsNotEmpty()
  @IsUUID()
  brandId: string;

  @ApiProperty({
    description: 'Brand authorization documents required for Official badge',
    type: [BadgeApplicationDocumentDto],
  })
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one document is required' })
  @ValidateNested({ each: true })
  @Type(() => BadgeApplicationDocumentDto)
  documents: BadgeApplicationDocumentDto[];
}

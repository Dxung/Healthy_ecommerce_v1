import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { BadgeApplicationDocumentDto } from './register-shop-argument.dto';

/**
 * DTO for applying for Verified badge
 */
export class ApplyVerifiedBadgeArgumentDto {
  @ApiProperty({
    description: 'Business documents required for Verified badge',
    type: [BadgeApplicationDocumentDto],
  })
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one document is required' })
  @ValidateNested({ each: true })
  @Type(() => BadgeApplicationDocumentDto)
  documents: BadgeApplicationDocumentDto[];
}

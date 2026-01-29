import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID, ArrayMinSize } from 'class-validator';

/**
 * DTO for reordering product images.
 */
export class ReorderImagesArgumentDto {
  @ApiProperty({
    description: 'Image IDs in the new order',
    type: [String],
  })
  @IsArray()
  @IsUUID('all', { each: true })
  @ArrayMinSize(1)
  imageIds: string[];
}

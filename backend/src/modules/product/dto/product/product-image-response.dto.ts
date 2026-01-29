import { ApiProperty } from '@nestjs/swagger';
import { ProductImage } from '../../models/product-image.model';

/**
 * Response DTO for product image.
 */
export class ProductImageResponseDto {
  @ApiProperty({ description: 'Image ID' })
  id: string;

  @ApiProperty({ description: 'Image URL' })
  imageUrl: string;

  @ApiProperty({ description: 'Sort order' })
  sortOrder: number;

  constructor(image: ProductImage) {
    this.id = image.id;
    this.imageUrl = image.imageUrl;
    this.sortOrder = image.sortOrder;
  }

  static fromList(images: ProductImage[]): ProductImageResponseDto[] {
    return images.map((image) => new ProductImageResponseDto(image));
  }
}

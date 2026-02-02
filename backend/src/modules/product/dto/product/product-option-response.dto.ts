import { ApiProperty } from '@nestjs/swagger';
import { ProductOption } from '../../models/product-option.model';
import { ProductOptionValue } from '../../models/product-option-value.model';

/**
 * Response DTO for option value.
 */
export class ProductOptionValueResponseDto {
  @ApiProperty({ description: 'Option value ID' })
  id: string;

  @ApiProperty({ description: 'Value (e.g., "S", "Red")' })
  value: string;

  @ApiProperty({ description: 'Sort order' })
  sortOrder: number;

  constructor(optionValue: ProductOptionValue) {
    this.id = optionValue.id;
    this.value = optionValue.value;
    this.sortOrder = optionValue.sortOrder;
  }
}

/**
 * Response DTO for product option.
 */
export class ProductOptionResponseDto {
  @ApiProperty({ description: 'Option ID' })
  id: string;

  @ApiProperty({ description: 'Option name (e.g., "Size", "Color")' })
  name: string;

  @ApiProperty({ description: 'Sort order' })
  sortOrder: number;

  @ApiProperty({
    description: 'Option values',
    type: [ProductOptionValueResponseDto],
  })
  values: ProductOptionValueResponseDto[];

  constructor(option: ProductOption) {
    this.id = option.id;
    this.name = option.name;
    this.sortOrder = option.sortOrder;
    this.values = option.values.map(
      (v) => new ProductOptionValueResponseDto(v),
    );
  }

  static fromList(options: ProductOption[]): ProductOptionResponseDto[] {
    return options.map((option) => new ProductOptionResponseDto(option));
  }
}

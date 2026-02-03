import { ApiProperty } from '@nestjs/swagger';

/**
 * Response DTO for a reviewable order item.
 */
export class ReviewableOrderItemResponseDto {
  @ApiProperty({ description: 'Order item ID' })
  orderItemId: string;

  @ApiProperty({ description: 'Order ID' })
  orderId: string;

  @ApiProperty({ description: 'Order code for display' })
  orderCode: string;

  @ApiProperty({ description: 'Variant name' })
  variantName: string;

  @ApiProperty({ description: 'When the order was completed' })
  completedAt: string;

  constructor(data: {
    orderItemId: string;
    orderId: string;
    orderCode: string;
    variantName: string;
    completedAt: Date;
  }) {
    this.orderItemId = data.orderItemId;
    this.orderId = data.orderId;
    this.orderCode = data.orderCode;
    this.variantName = data.variantName;
    this.completedAt = data.completedAt.toISOString();
  }
}

import { ApiProperty } from '@nestjs/swagger';

/**
 * Response DTO for shop product slots information.
 */
export class ProductSlotsInfoResponseDto {
  @ApiProperty({ description: 'Current number of products' })
  currentCount: number;

  @ApiProperty({ description: 'Maximum allowed product slots' })
  maxSlots: number;

  @ApiProperty({ description: 'Remaining available slots' })
  remainingSlots: number;

  @ApiProperty({ description: 'Whether the shop has reached the product limit' })
  isAtLimit: boolean;

  constructor(currentCount: number, maxSlots: number) {
    this.currentCount = currentCount;
    this.maxSlots = maxSlots;
    this.remainingSlots = Math.max(0, maxSlots - currentCount);
    this.isAtLimit = currentCount >= maxSlots;
  }
}

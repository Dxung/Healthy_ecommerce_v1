import { ApiProperty } from '@nestjs/swagger';
import { UnitConversion } from '../../models/unit-conversion.model';

/**
 * Response DTO for unit conversion information.
 */
export class UnitConversionResponseDto {
  @ApiProperty({ description: 'Conversion ID' })
  id: string;

  @ApiProperty({ description: 'Source unit ID' })
  fromUnitId: string;

  @ApiProperty({ description: 'Target unit ID' })
  toUnitId: string;

  @ApiProperty({ description: 'Conversion factor' })
  conversionFactor: number;

  @ApiProperty({ description: 'Whether conversion is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt: Date;

  constructor(conversion: UnitConversion) {
    this.id = conversion.id;
    this.fromUnitId = conversion.fromUnitId;
    this.toUnitId = conversion.toUnitId;
    this.conversionFactor = conversion.conversionFactor;
    this.isActive = conversion.isActive;
    this.createdAt = conversion.createdAt;
    this.updatedAt = conversion.updatedAt;
  }

  /**
   * Creates a list of UnitConversionResponseDto from an array of UnitConversion domain models.
   */
  static fromList(conversions: UnitConversion[]): UnitConversionResponseDto[] {
    return conversions.map(
      (conversion) => new UnitConversionResponseDto(conversion),
    );
  }
}

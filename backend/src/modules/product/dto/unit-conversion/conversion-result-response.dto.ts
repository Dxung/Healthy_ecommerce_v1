import { ApiProperty } from '@nestjs/swagger';
import { ConversionResult } from '../../unit.service.interface';

/**
 * Nested DTO for unit info in conversion result.
 */
class UnitInfoDto {
  @ApiProperty({ description: 'Unit symbol' })
  symbol: string;

  @ApiProperty({ description: 'Unit name' })
  name: string;
}

/**
 * Response DTO for conversion result.
 */
export class ConversionResultResponseDto {
  @ApiProperty({ description: 'Converted value' })
  result: number;

  @ApiProperty({ description: 'Source unit info', type: UnitInfoDto })
  from: UnitInfoDto;

  @ApiProperty({ description: 'Target unit info', type: UnitInfoDto })
  to: UnitInfoDto;

  constructor(conversionResult: ConversionResult) {
    this.result = conversionResult.result;
    this.from = conversionResult.from;
    this.to = conversionResult.to;
  }
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

/**
 * DTO for updating an existing unit conversion.
 */
export class UpdateUnitConversionArgumentDto {
  @ApiProperty({
    description: 'Conversion factor (multiply source by this to get target)',
    example: 1000,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  conversionFactor: number;
}

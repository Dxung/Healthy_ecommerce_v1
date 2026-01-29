import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsNumber, IsPositive } from 'class-validator';

/**
 * DTO for creating a new unit conversion.
 */
export class CreateUnitConversionArgumentDto {
  @ApiProperty({
    description: 'Source unit ID',
    example: '0192abc0-1234-7def-8901-234567890abc',
  })
  @IsNotEmpty()
  @IsUUID()
  fromUnitId: string;

  @ApiProperty({
    description: 'Target unit ID (should be base unit)',
    example: '0192abc0-1234-7def-8901-234567890def',
  })
  @IsNotEmpty()
  @IsUUID()
  toUnitId: string;

  @ApiProperty({
    description: 'Conversion factor (multiply source by this to get target)',
    example: 1000,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  conversionFactor: number;
}

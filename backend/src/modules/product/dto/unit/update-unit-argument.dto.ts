import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, MaxLength } from 'class-validator';
import { UnitType } from 'src/database/typeorm/entities/product/enums/unit-type.enum';

/**
 * DTO for updating an existing unit.
 */
export class UpdateUnitArgumentDto {
  @ApiPropertyOptional({
    description: 'Unit name',
    example: 'kilogram',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Unit symbol (must be unique)',
    example: 'kg',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  symbol?: string;

  @ApiPropertyOptional({
    description: 'Unit type (only for measurement units)',
    enum: UnitType,
    example: UnitType.WEIGHT,
  })
  @IsOptional()
  @IsEnum(UnitType)
  type?: UnitType;
}

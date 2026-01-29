import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { UnitCategory } from 'src/database/typeorm/entities/product/enums/unit-category.enum';
import { UnitType } from 'src/database/typeorm/entities/product/enums/unit-type.enum';

/**
 * DTO for creating a new unit.
 */
export class CreateUnitArgumentDto {
  @ApiProperty({
    description: 'Unit name',
    example: 'kilogram',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Unit symbol (must be unique)',
    example: 'kg',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  symbol: string;

  @ApiProperty({
    description: 'Unit category',
    enum: UnitCategory,
    example: UnitCategory.MEASUREMENT,
  })
  @IsNotEmpty()
  @IsEnum(UnitCategory)
  category: UnitCategory;

  @ApiPropertyOptional({
    description: 'Unit type (required for measurement units)',
    enum: UnitType,
    example: UnitType.WEIGHT,
  })
  @IsOptional()
  @IsEnum(UnitType)
  type?: UnitType;

  @ApiPropertyOptional({
    description: 'Whether this is a base unit for its type',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isBase?: boolean;
}

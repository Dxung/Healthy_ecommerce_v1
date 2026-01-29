import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Unit } from '../../models/unit.model';
import { UnitCategory } from 'src/database/typeorm/entities/product/enums/unit-category.enum';
import { UnitType } from 'src/database/typeorm/entities/product/enums/unit-type.enum';

/**
 * Response DTO for unit information.
 */
export class UnitResponseDto {
  @ApiProperty({ description: 'Unit ID' })
  id: string;

  @ApiProperty({ description: 'Unit name' })
  name: string;

  @ApiProperty({ description: 'Unit symbol' })
  symbol: string;

  @ApiProperty({
    description: 'Unit category',
    enum: UnitCategory,
  })
  category: UnitCategory;

  @ApiPropertyOptional({
    description: 'Unit type (for measurement units)',
    enum: UnitType,
    nullable: true,
  })
  type: UnitType | null;

  @ApiProperty({ description: 'Whether this is a base unit' })
  isBase: boolean;

  @ApiProperty({ description: 'Whether unit is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt: Date;

  constructor(unit: Unit) {
    this.id = unit.id;
    this.name = unit.name;
    this.symbol = unit.symbol;
    this.category = unit.category;
    this.type = unit.type;
    this.isBase = unit.isBase;
    this.isActive = unit.isActive;
    this.createdAt = unit.createdAt;
    this.updatedAt = unit.updatedAt;
  }

  /**
   * Creates a list of UnitResponseDto from an array of Unit domain models.
   */
  static fromList(units: Unit[]): UnitResponseDto[] {
    return units.map((unit) => new UnitResponseDto(unit));
  }
}

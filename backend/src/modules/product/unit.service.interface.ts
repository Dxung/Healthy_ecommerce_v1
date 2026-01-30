import type { ResultAsync } from 'neverthrow';
import type { Unit } from './models/unit.model';
import type { UnitConversion } from './models/unit-conversion.model';
import type { DomainError } from 'src/shared/types/domain-error.type';
import type { CreateUnitArgumentDto } from './dto/unit/create-unit-argument.dto';
import type { UpdateUnitArgumentDto } from './dto/unit/update-unit-argument.dto';
import type { CreateUnitConversionArgumentDto } from './dto/unit-conversion/create-unit-conversion-argument.dto';
import type { UpdateUnitConversionArgumentDto } from './dto/unit-conversion/update-unit-conversion-argument.dto';
import type { UnitCategory } from 'src/database/typeorm/entities/product/enums/unit-category.enum';

/**
 * Result of a unit conversion operation.
 */
export interface ConversionResult {
  result: number;
  from: { symbol: string; name: string };
  to: { symbol: string; name: string };
}

export interface IUnitService {
  // ======================== ADMIN UNIT OPERATIONS ========================

  /**
   * Gets all units (including inactive ones for admin).
   * @returns Array of Unit domain models.
   */
  getAllUnits(): ResultAsync<Unit[], DomainError>;

  /**
   * Gets a unit by its ID.
   * @param id - The unit ID.
   * @returns The Unit domain model.
   */
  getUnitById(id: string): ResultAsync<Unit, DomainError>;

  /**
   * Creates a new unit.
   * @param dto - The create unit DTO.
   * @returns The created Unit domain model.
   */
  createUnit(dto: CreateUnitArgumentDto): ResultAsync<Unit, DomainError>;

  /**
   * Updates an existing unit.
   * @param id - The unit ID.
   * @param dto - The update unit DTO.
   * @returns The updated Unit domain model.
   */
  updateUnit(
    id: string,
    dto: UpdateUnitArgumentDto,
  ): ResultAsync<Unit, DomainError>;

  /**
   * Activates a unit.
   * @param id - The unit ID.
   * @returns The activated Unit domain model.
   */
  activateUnit(id: string): ResultAsync<Unit, DomainError>;

  /**
   * Deactivates a unit.
   * @param id - The unit ID.
   * @returns The deactivated Unit domain model.
   */
  deactivateUnit(id: string): ResultAsync<Unit, DomainError>;

  /**
   * Soft deletes a unit.
   * @param id - The unit ID.
   * @returns void on success.
   */
  deleteUnit(id: string): ResultAsync<void, DomainError>;

  // ======================== ADMIN CONVERSION OPERATIONS ========================

  /**
   * Gets all unit conversions.
   * @returns Array of UnitConversion domain models.
   */
  getAllConversions(): ResultAsync<UnitConversion[], DomainError>;

  /**
   * Creates a new unit conversion.
   * @param dto - The create conversion DTO.
   * @returns The created UnitConversion domain model.
   */
  createConversion(
    dto: CreateUnitConversionArgumentDto,
  ): ResultAsync<UnitConversion, DomainError>;

  /**
   * Updates an existing unit conversion.
   * @param id - The conversion ID.
   * @param dto - The update conversion DTO.
   * @returns The updated UnitConversion domain model.
   */
  updateConversion(
    id: string,
    dto: UpdateUnitConversionArgumentDto,
  ): ResultAsync<UnitConversion, DomainError>;

  /**
   * Deletes a unit conversion.
   * @param id - The conversion ID.
   * @returns void on success.
   */
  deleteConversion(id: string): ResultAsync<void, DomainError>;

  // ======================== PUBLIC OPERATIONS ========================

  /**
   * Gets all active units.
   * @returns Array of active Unit domain models.
   */
  getActiveUnits(): ResultAsync<Unit[], DomainError>;

  /**
   * Gets active units by category.
   * @param category - The unit category (measurement or selling).
   * @returns Array of active Unit domain models.
   */
  getActiveUnitsByCategory(
    category: UnitCategory,
  ): ResultAsync<Unit[], DomainError>;

  /**
   * Converts a value from one unit to another using their symbols.
   * @param fromSymbol - The source unit symbol (e.g., "kg").
   * @param toSymbol - The target unit symbol (e.g., "g").
   * @param value - The value to convert.
   * @returns The conversion result with value and unit information.
   */
  convert(
    fromSymbol: string,
    toSymbol: string,
    value: number,
  ): ResultAsync<ConversionResult, DomainError>;
}

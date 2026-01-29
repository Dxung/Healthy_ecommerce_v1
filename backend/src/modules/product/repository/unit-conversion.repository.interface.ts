import type { ResultAsync } from 'neverthrow';
import type { UnitConversion } from '../models/unit-conversion.model';
import type { DomainError } from 'src/shared/types/domain-error.type';

/**
 * Filter options for querying unit conversions.
 */
export interface UnitConversionFilter {
  fromUnitId?: string;
  toUnitId?: string;
  isActive?: boolean;
}

export interface IUnitConversionRepository {
  /**
   * Finds a unit conversion by its ID.
   * @param id - The conversion ID.
   * @returns The UnitConversion domain model or null if not found.
   */
  findById(id: string): ResultAsync<UnitConversion | null, DomainError>;

  /**
   * Finds a unit conversion by the source and target unit IDs.
   * @param fromUnitId - The source unit ID.
   * @param toUnitId - The target unit ID.
   * @returns The UnitConversion domain model or null if not found.
   */
  findByUnitPair(
    fromUnitId: string,
    toUnitId: string,
  ): ResultAsync<UnitConversion | null, DomainError>;

  /**
   * Finds all unit conversions matching the filter criteria.
   * @param filter - Optional filter criteria.
   * @returns Array of UnitConversion domain models.
   */
  findAll(
    filter?: UnitConversionFilter,
  ): ResultAsync<UnitConversion[], DomainError>;

  /**
   * Finds all conversions involving a specific unit (as source or target).
   * @param unitId - The unit ID to find conversions for.
   * @returns Array of UnitConversion domain models.
   */
  findByUnitId(unitId: string): ResultAsync<UnitConversion[], DomainError>;

  /**
   * Creates a new unit conversion.
   * @param conversion - The UnitConversion domain model to create.
   * @returns The created UnitConversion domain model.
   */
  create(conversion: UnitConversion): ResultAsync<UnitConversion, DomainError>;

  /**
   * Updates an existing unit conversion.
   * @param conversion - The UnitConversion domain model with updated fields.
   * @returns The updated UnitConversion domain model.
   */
  update(conversion: UnitConversion): ResultAsync<UnitConversion, DomainError>;

  /**
   * Deletes a unit conversion (hard delete).
   * @param id - The conversion ID to delete.
   * @returns void on success.
   */
  delete(id: string): ResultAsync<void, DomainError>;

  /**
   * Checks if a conversion between two units already exists.
   * @param fromUnitId - The source unit ID.
   * @param toUnitId - The target unit ID.
   * @param excludeId - Optional conversion ID to exclude from the check.
   * @returns True if conversion exists, false otherwise.
   */
  conversionExists(
    fromUnitId: string,
    toUnitId: string,
    excludeId?: string,
  ): ResultAsync<boolean, DomainError>;
}

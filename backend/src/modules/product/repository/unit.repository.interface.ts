import type { ResultAsync } from 'neverthrow';
import type { Unit } from '../models/unit.model';
import type { DomainError } from 'src/shared/types/domain-error.type';
import type { UnitCategory } from 'src/database/typeorm/entities/product/enums/unit-category.enum';

/**
 * Filter options for querying units.
 */
export interface UnitFilter {
  category?: UnitCategory;
  isActive?: boolean;
  isBase?: boolean;
}

export interface IUnitRepository {
  /**
   * Finds a unit by its ID.
   * @param id - The unit ID.
   * @returns The Unit domain model or null if not found.
   */
  findById(id: string): ResultAsync<Unit | null, DomainError>;

  /**
   * Finds units by their IDs.
   * @param ids - Array of unit IDs.
   * @returns Array of Unit domain models found.
   */
  findByIds(ids: string[]): ResultAsync<Unit[], DomainError>;

  /**
   * Finds a unit by its symbol.
   * @param symbol - The unit symbol (e.g., "g", "kg").
   * @returns The Unit domain model or null if not found.
   */
  findBySymbol(symbol: string): ResultAsync<Unit | null, DomainError>;

  /**
   * Finds all units matching the filter criteria.
   * @param filter - Optional filter criteria.
   * @returns Array of Unit domain models.
   */
  findAll(filter?: UnitFilter): ResultAsync<Unit[], DomainError>;

  /**
   * Creates a new unit.
   * @param unit - The Unit domain model to create.
   * @returns The created Unit domain model.
   */
  create(unit: Unit): ResultAsync<Unit, DomainError>;

  /**
   * Updates an existing unit.
   * @param unit - The Unit domain model with updated fields.
   * @returns The updated Unit domain model.
   */
  update(unit: Unit): ResultAsync<Unit, DomainError>;

  /**
   * Soft deletes a unit.
   * @param id - The unit ID to delete.
   * @returns void on success.
   */
  softDelete(id: string): ResultAsync<void, DomainError>;

  /**
   * Checks if a symbol already exists (excluding a specific unit ID).
   * @param symbol - The symbol to check.
   * @param excludeId - Optional unit ID to exclude from the check.
   * @returns True if symbol exists, false otherwise.
   */
  symbolExists(
    symbol: string,
    excludeId?: string,
  ): ResultAsync<boolean, DomainError>;
}

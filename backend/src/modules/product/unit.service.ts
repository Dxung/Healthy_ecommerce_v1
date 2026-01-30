import { Inject, Injectable } from '@nestjs/common';
import { IUnitService, ConversionResult } from './unit.service.interface';
import {
  UNIT_REPOSITORY,
  UNIT_CONVERSION_REPOSITORY,
} from 'src/database/typeorm/tokens/database.token';
import type { IUnitRepository } from './repository/unit.repository.interface';
import type { IUnitConversionRepository } from './repository/unit-conversion.repository.interface';
import { Unit } from './models/unit.model';
import { UnitConversion } from './models/unit-conversion.model';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import { errAsync, okAsync, ResultAsync } from 'neverthrow';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { PRODUCT_ERRORS } from './errors/product.errors';
import type { CreateUnitArgumentDto } from './dto/unit/create-unit-argument.dto';
import type { UpdateUnitArgumentDto } from './dto/unit/update-unit-argument.dto';
import type { CreateUnitConversionArgumentDto } from './dto/unit-conversion/create-unit-conversion-argument.dto';
import type { UpdateUnitConversionArgumentDto } from './dto/unit-conversion/update-unit-conversion-argument.dto';
import { UnitCategory } from 'src/database/typeorm/entities/product/enums/unit-category.enum';

@Injectable()
export class UnitService implements IUnitService {
  constructor(
    @Inject(UNIT_REPOSITORY)
    private readonly unitRepository: IUnitRepository,
    @Inject(UNIT_CONVERSION_REPOSITORY)
    private readonly conversionRepository: IUnitConversionRepository,
  ) {}

  // ======================== ADMIN UNIT OPERATIONS ========================

  @WithPosition()
  getAllUnits(): ResultAsync<Unit[], DomainError> {
    return this.unitRepository.findAll();
  }

  @WithPosition()
  getUnitById(id: string): ResultAsync<Unit, DomainError> {
    return this.unitRepository.findById(id).andThen((unit) => {
      if (!unit) {
        return errAsync(
          createDomainError(PRODUCT_ERRORS.UNIT_NOT_FOUND, {
            cause: `Unit with ID ${id} not found`,
          }),
        );
      }
      return okAsync(unit);
    });
  }

  @WithPosition()
  createUnit(dto: CreateUnitArgumentDto): ResultAsync<Unit, DomainError> {
    return this.unitRepository
      .symbolExists(dto.symbol)
      .andThen((exists) => {
        if (exists) {
          return errAsync(
            createDomainError(PRODUCT_ERRORS.UNIT_SYMBOL_EXISTS, {
              cause: `Symbol "${dto.symbol}" already exists`,
            }),
          );
        }
        return okAsync(undefined);
      })
      .andThen(() => {
        const unit = Unit.create({
          name: dto.name,
          symbol: dto.symbol,
          category: dto.category,
          type: dto.type ?? null,
          isBase: dto.isBase ?? false,
        });
        return this.unitRepository.create(unit);
      });
  }

  @WithPosition()
  updateUnit(
    id: string,
    dto: UpdateUnitArgumentDto,
  ): ResultAsync<Unit, DomainError> {
    return this.getUnitById(id)
      .andThen((unit) => {
        // Check if symbol already exists (exclude current unit)
        if (dto.symbol) {
          return this.unitRepository
            .symbolExists(dto.symbol, id)
            .andThen((exists) => {
              if (exists) {
                return errAsync(
                  createDomainError(PRODUCT_ERRORS.UNIT_SYMBOL_EXISTS, {
                    cause: `Symbol "${dto.symbol}" already exists`,
                  }),
                );
              }
              return okAsync(unit);
            });
        }
        return okAsync(unit);
      })
      .andThen((unit) => {
        if (
          dto.name !== undefined ||
          dto.symbol !== undefined ||
          dto.type !== undefined
        ) {
          unit.updateInfo(
            dto.name ?? unit.name,
            dto.symbol ?? unit.symbol,
            dto.type !== undefined ? dto.type : unit.type,
          );
        }
        return this.unitRepository.update(unit);
      });
  }

  @WithPosition()
  activateUnit(id: string): ResultAsync<Unit, DomainError> {
    return this.getUnitById(id).andThen((unit) => {
      unit.activate();
      return this.unitRepository.update(unit);
    });
  }

  @WithPosition()
  deactivateUnit(id: string): ResultAsync<Unit, DomainError> {
    return this.getUnitById(id).andThen((unit) => {
      unit.deactivate();
      return this.unitRepository.update(unit);
    });
  }

  @WithPosition()
  deleteUnit(id: string): ResultAsync<void, DomainError> {
    return this.getUnitById(id).andThen(() => {
      return this.unitRepository.softDelete(id);
    });
  }

  // ======================== ADMIN CONVERSION OPERATIONS ========================

  @WithPosition()
  getAllConversions(): ResultAsync<UnitConversion[], DomainError> {
    return this.conversionRepository.findAll();
  }

  @WithPosition()
  createConversion(
    dto: CreateUnitConversionArgumentDto,
  ): ResultAsync<UnitConversion, DomainError> {
    // Validate same unit check
    if (dto.fromUnitId === dto.toUnitId) {
      return errAsync(
        createDomainError(PRODUCT_ERRORS.UNIT_CONVERSION_SAME_UNIT, {
          cause: 'Cannot create conversion from unit to itself',
        }),
      );
    }

    // Fetch both units to validate they exist and have matching types
    return ResultAsync.combine([
      this.getUnitById(dto.fromUnitId),
      this.getUnitById(dto.toUnitId),
    ])
      .andThen(([fromUnit, toUnit]) => {
        // Only measurement units can have conversions
        if (!fromUnit.isMeasurementUnit() || !toUnit.isMeasurementUnit()) {
          return errAsync(
            createDomainError(PRODUCT_ERRORS.UNIT_CONVERSION_TYPE_MISMATCH, {
              cause: 'Only measurement units can have conversions',
            }),
          );
        }

        // Check same type
        if (fromUnit.type !== toUnit.type) {
          return errAsync(
            createDomainError(PRODUCT_ERRORS.UNIT_CONVERSION_TYPE_MISMATCH, {
              cause: `Cannot convert between ${fromUnit.type} and ${toUnit.type}`,
            }),
          );
        }

        return okAsync(undefined);
      })
      .andThen(() => {
        // Check if conversion already exists
        return this.conversionRepository
          .conversionExists(dto.fromUnitId, dto.toUnitId)
          .andThen((exists) => {
            if (exists) {
              return errAsync(
                createDomainError(PRODUCT_ERRORS.UNIT_CONVERSION_EXISTS, {
                  cause: 'Conversion between these units already exists',
                }),
              );
            }
            return okAsync(undefined);
          });
      })
      .andThen(() => {
        const conversion = UnitConversion.create({
          fromUnitId: dto.fromUnitId,
          toUnitId: dto.toUnitId,
          conversionFactor: dto.conversionFactor,
        });
        return this.conversionRepository.create(conversion);
      });
  }

  @WithPosition()
  updateConversion(
    id: string,
    dto: UpdateUnitConversionArgumentDto,
  ): ResultAsync<UnitConversion, DomainError> {
    return this.conversionRepository.findById(id).andThen((conversion) => {
      if (!conversion) {
        return errAsync(
          createDomainError(PRODUCT_ERRORS.UNIT_CONVERSION_NOT_FOUND, {
            cause: `Conversion with ID ${id} not found`,
          }),
        );
      }
      conversion.updateFactor(dto.conversionFactor);
      return this.conversionRepository.update(conversion);
    });
  }

  @WithPosition()
  deleteConversion(id: string): ResultAsync<void, DomainError> {
    return this.conversionRepository.findById(id).andThen((conversion) => {
      if (!conversion) {
        return errAsync(
          createDomainError(PRODUCT_ERRORS.UNIT_CONVERSION_NOT_FOUND, {
            cause: `Conversion with ID ${id} not found`,
          }),
        );
      }
      return this.conversionRepository.delete(id);
    });
  }

  // ======================== PUBLIC OPERATIONS ========================

  @WithPosition()
  getActiveUnits(): ResultAsync<Unit[], DomainError> {
    return this.unitRepository.findAll({ isActive: true });
  }

  @WithPosition()
  getActiveUnitsByCategory(
    category: UnitCategory,
  ): ResultAsync<Unit[], DomainError> {
    return this.unitRepository.findAll({ category, isActive: true });
  }

  @WithPosition()
  convert(
    fromSymbol: string,
    toSymbol: string,
    value: number,
  ): ResultAsync<ConversionResult, DomainError> {
    // Fetch both units by symbol
    return ResultAsync.combine([
      this.unitRepository.findBySymbol(fromSymbol),
      this.unitRepository.findBySymbol(toSymbol),
    ]).andThen(([fromUnit, toUnit]) => {
      if (!fromUnit) {
        return errAsync(
          createDomainError(PRODUCT_ERRORS.UNIT_NOT_FOUND, {
            cause: `Unit with symbol "${fromSymbol}" not found`,
          }),
        );
      }
      if (!toUnit) {
        return errAsync(
          createDomainError(PRODUCT_ERRORS.UNIT_NOT_FOUND, {
            cause: `Unit with symbol "${toSymbol}" not found`,
          }),
        );
      }

      // Same unit - no conversion needed
      if (fromUnit.id === toUnit.id) {
        return okAsync({
          result: value,
          from: { symbol: fromUnit.symbol, name: fromUnit.name },
          to: { symbol: toUnit.symbol, name: toUnit.name },
        } as ConversionResult);
      }

      // Check type mismatch
      if (!fromUnit.canConvertTo(toUnit)) {
        return errAsync(
          createDomainError(PRODUCT_ERRORS.UNIT_CONVERSION_TYPE_MISMATCH, {
            cause: `Cannot convert between ${fromUnit.type} and ${toUnit.type}`,
          }),
        );
      }

      return this.performConversion(fromUnit, toUnit, value);
    });
  }

  /**
   * Performs the actual conversion between two units.
   * Handles direct conversion, reverse conversion, and multi-hop via base unit.
   */
  private performConversion(
    fromUnit: Unit,
    toUnit: Unit,
    value: number,
  ): ResultAsync<ConversionResult, DomainError> {
    // Try direct conversion (from → to)
    return this.conversionRepository
      .findByUnitPair(fromUnit.id, toUnit.id)
      .andThen((directConversion) => {
        if (directConversion && directConversion.isActive) {
          return okAsync({
            result: directConversion.convert(value),
            from: { symbol: fromUnit.symbol, name: fromUnit.name },
            to: { symbol: toUnit.symbol, name: toUnit.name },
          } as ConversionResult);
        }

        // Try reverse conversion (to → from, then invert)
        return this.conversionRepository
          .findByUnitPair(toUnit.id, fromUnit.id)
          .andThen((reverseConversion) => {
            if (reverseConversion && reverseConversion.isActive) {
              return okAsync({
                result: reverseConversion.convertReverse(value),
                from: { symbol: fromUnit.symbol, name: fromUnit.name },
                to: { symbol: toUnit.symbol, name: toUnit.name },
              } as ConversionResult);
            }

            // Multi-hop: convert via base unit
            return this.convertViaBaseUnit(fromUnit, toUnit, value);
          });
      });
  }

  /**
   * Converts via the base unit when direct conversion is not available.
   * Example: kg → mg = kg → g → mg
   */
  private convertViaBaseUnit(
    fromUnit: Unit,
    toUnit: Unit,
    value: number,
  ): ResultAsync<ConversionResult, DomainError> {
    // Find base unit for this type
    return this.unitRepository
      .findAll({ isBase: true, isActive: true })
      .andThen((baseUnits) => {
        const baseUnit = baseUnits.find((u) => u.type === fromUnit.type);
        if (!baseUnit) {
          return errAsync(
            createDomainError(PRODUCT_ERRORS.UNIT_CONVERSION_NOT_AVAILABLE, {
              cause: `No base unit found for type ${fromUnit.type}`,
            }),
          );
        }

        // If from is base, convert directly to target
        if (fromUnit.isBase) {
          return this.conversionRepository
            .findByUnitPair(toUnit.id, baseUnit.id)
            .andThen((toBaseConversion) => {
              if (toBaseConversion && toBaseConversion.isActive) {
                // Reverse: base → target = value / factor
                return okAsync({
                  result: toBaseConversion.convertReverse(value),
                  from: { symbol: fromUnit.symbol, name: fromUnit.name },
                  to: { symbol: toUnit.symbol, name: toUnit.name },
                } as ConversionResult);
              }
              return errAsync(
                createDomainError(
                  PRODUCT_ERRORS.UNIT_CONVERSION_NOT_AVAILABLE,
                  {
                    cause: `No conversion path found from ${fromUnit.symbol} to ${toUnit.symbol}`,
                  },
                ),
              );
            });
        }

        // If to is base, convert from source to base
        if (toUnit.isBase) {
          return this.conversionRepository
            .findByUnitPair(fromUnit.id, baseUnit.id)
            .andThen((fromBaseConversion) => {
              if (fromBaseConversion && fromBaseConversion.isActive) {
                return okAsync({
                  result: fromBaseConversion.convert(value),
                  from: { symbol: fromUnit.symbol, name: fromUnit.name },
                  to: { symbol: toUnit.symbol, name: toUnit.name },
                } as ConversionResult);
              }
              return errAsync(
                createDomainError(
                  PRODUCT_ERRORS.UNIT_CONVERSION_NOT_AVAILABLE,
                  {
                    cause: `No conversion path found from ${fromUnit.symbol} to ${toUnit.symbol}`,
                  },
                ),
              );
            });
        }

        // Neither is base: from → base → to
        return ResultAsync.combine([
          this.conversionRepository.findByUnitPair(fromUnit.id, baseUnit.id),
          this.conversionRepository.findByUnitPair(toUnit.id, baseUnit.id),
        ]).andThen(([fromToBase, toToBase]) => {
          if (
            fromToBase &&
            fromToBase.isActive &&
            toToBase &&
            toToBase.isActive
          ) {
            // from → base: value * fromFactor
            const baseValue = fromToBase.convert(value);
            // base → to: baseValue / toFactor
            const result = toToBase.convertReverse(baseValue);
            return okAsync({
              result,
              from: { symbol: fromUnit.symbol, name: fromUnit.name },
              to: { symbol: toUnit.symbol, name: toUnit.name },
            } as ConversionResult);
          }
          return errAsync(
            createDomainError(PRODUCT_ERRORS.UNIT_CONVERSION_NOT_AVAILABLE, {
              cause: `No conversion path found from ${fromUnit.symbol} to ${toUnit.symbol}`,
            }),
          );
        });
      });
  }
}

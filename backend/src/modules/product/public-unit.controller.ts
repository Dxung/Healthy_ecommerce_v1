import {
  Controller,
  Get,
  Query,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { UNIT_SERVICE } from './tokens/product.token';
import { IUnitService } from './unit.service.interface';
import { UnitResponseDto } from './dto/unit/unit-response.dto';
import { ConversionResultResponseDto } from './dto/unit-conversion/conversion-result-response.dto';
import { ProductErrorHttpMapper } from './errors/product-errors-http.mapper';
import { ExceptionSource } from 'src/common/exception filters/exception-source';
import { UnitCategory } from 'src/database/typeorm/entities/product/enums/unit-category.enum';

@ApiTags('Units')
@Controller('units')
export class PublicUnitController {
  constructor(
    @Inject(UNIT_SERVICE)
    private readonly unitService: IUnitService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all active units' })
  @ApiResponse({
    status: 200,
    description: 'List of active units',
    type: [UnitResponseDto],
  })
  getActiveUnits(): Promise<UnitResponseDto[]> {
    return this.unitService.getActiveUnits().match(
      (units) => UnitResponseDto.fromList(units),
      (error) => {
        throw ProductErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Get('measurement')
  @ApiOperation({ summary: 'Get active measurement units' })
  @ApiResponse({
    status: 200,
    description: 'List of active measurement units',
    type: [UnitResponseDto],
  })
  getMeasurementUnits(): Promise<UnitResponseDto[]> {
    return this.unitService
      .getActiveUnitsByCategory(UnitCategory.MEASUREMENT)
      .match(
        (units) => UnitResponseDto.fromList(units),
        (error) => {
          throw ProductErrorHttpMapper.toHttpException(
            error,
            ExceptionSource.CONTROLLER,
          );
        },
      );
  }

  @Get('selling')
  @ApiOperation({ summary: 'Get active selling units' })
  @ApiResponse({
    status: 200,
    description: 'List of active selling units',
    type: [UnitResponseDto],
  })
  getSellingUnits(): Promise<UnitResponseDto[]> {
    return this.unitService
      .getActiveUnitsByCategory(UnitCategory.SELLING)
      .match(
        (units) => UnitResponseDto.fromList(units),
        (error) => {
          throw ProductErrorHttpMapper.toHttpException(
            error,
            ExceptionSource.CONTROLLER,
          );
        },
      );
  }

  @Get('convert')
  @ApiOperation({ summary: 'Convert value between units' })
  @ApiQuery({
    name: 'from',
    required: true,
    type: String,
    description: 'Source unit symbol (e.g., "kg")',
    example: 'kg',
  })
  @ApiQuery({
    name: 'to',
    required: true,
    type: String,
    description: 'Target unit symbol (e.g., "g")',
    example: 'g',
  })
  @ApiQuery({
    name: 'value',
    required: true,
    type: Number,
    description: 'Value to convert',
    example: 2.5,
  })
  @ApiResponse({
    status: 200,
    description: 'Conversion result',
    type: ConversionResultResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input or type mismatch' })
  @ApiResponse({ status: 404, description: 'Unit not found' })
  convert(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('value') value: string,
  ): Promise<ConversionResultResponseDto> {
    const numericValue = parseFloat(value);

    if (isNaN(numericValue)) {
      throw new BadRequestException('Value must be a valid number');
    }

    return this.unitService.convert(from, to, numericValue).match(
      (result) => new ConversionResultResponseDto(result),
      (error) => {
        throw ProductErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }
}

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Inject,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UNIT_SERVICE } from './tokens/product.token';
import { IUnitService } from './unit.service.interface';
import { CreateUnitArgumentDto } from './dto/unit/create-unit-argument.dto';
import { UpdateUnitArgumentDto } from './dto/unit/update-unit-argument.dto';
import { UnitResponseDto } from './dto/unit/unit-response.dto';
import { CreateUnitConversionArgumentDto } from './dto/unit-conversion/create-unit-conversion-argument.dto';
import { UpdateUnitConversionArgumentDto } from './dto/unit-conversion/update-unit-conversion-argument.dto';
import { UnitConversionResponseDto } from './dto/unit-conversion/unit-conversion-response.dto';
import { ProductErrorHttpMapper } from './errors/product-errors-http.mapper';
import { ExceptionSource } from 'src/common/exception filters/exception-source';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../authorization/guards/permissions.guard';
import { Permissions } from '../authorization/decorators/permissions.decorator';

@ApiTags('Admin - Units')
@ApiBearerAuth()
@Controller('admin/units')
@UseGuards(AuthGuard, PermissionsGuard)
export class AdminUnitController {
  constructor(
    @Inject(UNIT_SERVICE)
    private readonly unitService: IUnitService,
  ) {}

  // ======================== UNIT ENDPOINTS ========================

  @Get()
  @Permissions('unit:read')
  @ApiOperation({ summary: 'Get all units (including inactive)' })
  @ApiResponse({
    status: 200,
    description: 'List of all units',
    type: [UnitResponseDto],
  })
  getAllUnits(): Promise<UnitResponseDto[]> {
    return this.unitService.getAllUnits().match(
      (units) => UnitResponseDto.fromList(units),
      (error) => {
        throw ProductErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Get(':id')
  @Permissions('unit:read')
  @ApiOperation({ summary: 'Get unit by ID' })
  @ApiResponse({
    status: 200,
    description: 'Unit details',
    type: UnitResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Unit not found' })
  getUnitById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UnitResponseDto> {
    return this.unitService.getUnitById(id).match(
      (unit) => new UnitResponseDto(unit),
      (error) => {
        throw ProductErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Post()
  @Permissions('unit:create')
  @ApiOperation({ summary: 'Create a new unit' })
  @ApiResponse({
    status: 201,
    description: 'Unit created',
    type: UnitResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 409, description: 'Symbol already exists' })
  createUnit(@Body() dto: CreateUnitArgumentDto): Promise<UnitResponseDto> {
    return this.unitService.createUnit(dto).match(
      (unit) => new UnitResponseDto(unit),
      (error) => {
        throw ProductErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Patch(':id')
  @Permissions('unit:update')
  @ApiOperation({ summary: 'Update a unit' })
  @ApiResponse({
    status: 200,
    description: 'Unit updated',
    type: UnitResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Unit not found' })
  @ApiResponse({ status: 409, description: 'Symbol already exists' })
  updateUnit(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUnitArgumentDto,
  ): Promise<UnitResponseDto> {
    return this.unitService.updateUnit(id, dto).match(
      (unit) => new UnitResponseDto(unit),
      (error) => {
        throw ProductErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Patch(':id/activate')
  @Permissions('unit:update')
  @ApiOperation({ summary: 'Activate a unit' })
  @ApiResponse({
    status: 200,
    description: 'Unit activated',
    type: UnitResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Unit not found' })
  activateUnit(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UnitResponseDto> {
    return this.unitService.activateUnit(id).match(
      (unit) => new UnitResponseDto(unit),
      (error) => {
        throw ProductErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Patch(':id/deactivate')
  @Permissions('unit:update')
  @ApiOperation({ summary: 'Deactivate a unit' })
  @ApiResponse({
    status: 200,
    description: 'Unit deactivated',
    type: UnitResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Unit not found' })
  deactivateUnit(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UnitResponseDto> {
    return this.unitService.deactivateUnit(id).match(
      (unit) => new UnitResponseDto(unit),
      (error) => {
        throw ProductErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Delete(':id')
  @Permissions('unit:delete')
  @ApiOperation({ summary: 'Soft delete a unit' })
  @ApiResponse({ status: 200, description: 'Unit deleted' })
  @ApiResponse({ status: 404, description: 'Unit not found' })
  deleteUnit(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    return this.unitService.deleteUnit(id).match(
      () => ({ message: 'Unit deleted successfully' }),
      (error) => {
        throw ProductErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  // ======================== CONVERSION ENDPOINTS ========================

  @Get('conversions/all')
  @Permissions('unit:read')
  @ApiOperation({ summary: 'Get all unit conversions' })
  @ApiResponse({
    status: 200,
    description: 'List of all unit conversions',
    type: [UnitConversionResponseDto],
  })
  getAllConversions(): Promise<UnitConversionResponseDto[]> {
    return this.unitService.getAllConversions().match(
      (conversions) => UnitConversionResponseDto.fromList(conversions),
      (error) => {
        throw ProductErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Post('conversions')
  @Permissions('unit:create')
  @ApiOperation({ summary: 'Create a new unit conversion' })
  @ApiResponse({
    status: 201,
    description: 'Conversion created',
    type: UnitConversionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input or type mismatch' })
  @ApiResponse({ status: 409, description: 'Conversion already exists' })
  createConversion(
    @Body() dto: CreateUnitConversionArgumentDto,
  ): Promise<UnitConversionResponseDto> {
    return this.unitService.createConversion(dto).match(
      (conversion) => new UnitConversionResponseDto(conversion),
      (error) => {
        throw ProductErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Patch('conversions/:id')
  @Permissions('unit:update')
  @ApiOperation({ summary: 'Update a unit conversion' })
  @ApiResponse({
    status: 200,
    description: 'Conversion updated',
    type: UnitConversionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Conversion not found' })
  updateConversion(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUnitConversionArgumentDto,
  ): Promise<UnitConversionResponseDto> {
    return this.unitService.updateConversion(id, dto).match(
      (conversion) => new UnitConversionResponseDto(conversion),
      (error) => {
        throw ProductErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Delete('conversions/:id')
  @Permissions('unit:delete')
  @ApiOperation({ summary: 'Delete a unit conversion' })
  @ApiResponse({ status: 200, description: 'Conversion deleted' })
  @ApiResponse({ status: 404, description: 'Conversion not found' })
  deleteConversion(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    return this.unitService.deleteConversion(id).match(
      () => ({ message: 'Conversion deleted successfully' }),
      (error) => {
        throw ProductErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }
}

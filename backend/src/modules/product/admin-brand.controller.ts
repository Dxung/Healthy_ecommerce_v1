import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Inject,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { BRAND_SERVICE } from './tokens/product.token';
import { IBrandService } from './brand.service.interface';
import { CreateBrandArgumentDto } from './dto/brand/create-brand-argument.dto';
import { UpdateBrandArgumentDto } from './dto/brand/update-brand-argument.dto';
import { BrandResponseDto } from './dto/brand/brand-response.dto';
import { ProductErrorHttpMapper } from './errors/product-errors-http.mapper';
import { ExceptionSource } from 'src/common/exception filters/exception-source';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../authorization/guards/permissions.guard';
import { Permissions } from '../authorization/decorators/permissions.decorator';

@ApiTags('Admin - Brands')
@ApiBearerAuth()
@Controller('admin/brands')
@UseGuards(AuthGuard, PermissionsGuard)
export class AdminBrandController {
  constructor(
    @Inject(BRAND_SERVICE)
    private readonly brandService: IBrandService,
  ) {}

  @Get()
  @Permissions('brand:read')
  @ApiOperation({ summary: 'Get all brands' })
  @ApiQuery({
    name: 'activeOnly',
    required: false,
    type: Boolean,
    description: 'Filter by active status',
  })
  @ApiResponse({
    status: 200,
    description: 'List of brands',
    type: [BrandResponseDto],
  })
  async getAllBrands(
    @Query('activeOnly') activeOnly?: string,
  ): Promise<BrandResponseDto[]> {
    const isActiveOnly = activeOnly === 'true';

    const result = await this.brandService.getAllBrands(isActiveOnly);

    if (result.isErr()) {
      throw ProductErrorHttpMapper.toHttpException(
        result.error,
        ExceptionSource.CONTROLLER,
      );
    }

    return BrandResponseDto.fromList(result.value);
  }

  @Get(':id')
  @Permissions('brand:read')
  @ApiOperation({ summary: 'Get brand by ID' })
  @ApiResponse({
    status: 200,
    description: 'Brand details',
    type: BrandResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Brand not found' })
  async getBrandById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BrandResponseDto> {
    const result = await this.brandService.getBrandById(id);

    if (result.isErr()) {
      throw ProductErrorHttpMapper.toHttpException(
        result.error,
        ExceptionSource.CONTROLLER,
      );
    }

    return new BrandResponseDto(result.value);
  }

  @Post()
  @Permissions('brand:create')
  @ApiOperation({ summary: 'Create a new brand' })
  @ApiResponse({
    status: 201,
    description: 'Brand created',
    type: BrandResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 409, description: 'Slug already exists' })
  async createBrand(
    @Body() dto: CreateBrandArgumentDto,
  ): Promise<BrandResponseDto> {
    const result = await this.brandService.createBrand(dto);

    if (result.isErr()) {
      throw ProductErrorHttpMapper.toHttpException(
        result.error,
        ExceptionSource.CONTROLLER,
      );
    }

    return new BrandResponseDto(result.value);
  }

  @Patch(':id')
  @Permissions('brand:update')
  @ApiOperation({ summary: 'Update a brand' })
  @ApiResponse({
    status: 200,
    description: 'Brand updated',
    type: BrandResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Brand not found' })
  @ApiResponse({ status: 409, description: 'Slug already exists' })
  async updateBrand(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBrandArgumentDto,
  ): Promise<BrandResponseDto> {
    const result = await this.brandService.updateBrand(id, dto);

    if (result.isErr()) {
      throw ProductErrorHttpMapper.toHttpException(
        result.error,
        ExceptionSource.CONTROLLER,
      );
    }

    return new BrandResponseDto(result.value);
  }

  @Delete(':id')
  @Permissions('brand:delete')
  @ApiOperation({ summary: 'Delete a brand' })
  @ApiResponse({ status: 200, description: 'Brand deleted' })
  @ApiResponse({ status: 404, description: 'Brand not found' })
  @ApiResponse({ status: 409, description: 'Brand has products' })
  async deleteBrand(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    const result = await this.brandService.deleteBrand(id);

    if (result.isErr()) {
      throw ProductErrorHttpMapper.toHttpException(
        result.error,
        ExceptionSource.CONTROLLER,
      );
    }

    return { message: 'Brand deleted successfully' };
  }
}

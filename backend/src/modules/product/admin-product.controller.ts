import {
  Controller,
  Get,
  Delete,
  Param,
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
import { ADMIN_PRODUCT_SERVICE } from './tokens/product.token';
import { IAdminProductService } from './admin-product.service.interface';
import { ProductListResponseDto, ProductDetailResponseDto } from './dto';
import { ProductErrorHttpMapper } from './errors/product-errors-http.mapper';
import { ExceptionSource } from 'src/common/exception filters/exception-source';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../authorization/guards/permissions.guard';
import { Permissions } from '../authorization/decorators/permissions.decorator';
import { ProductStatus } from 'src/database/typeorm/entities/product/enums/product-status.enum';

@ApiTags('Admin - Products')
@ApiBearerAuth()
@Controller('admin/products')
@UseGuards(AuthGuard, PermissionsGuard)
export class AdminProductController {
  constructor(
    @Inject(ADMIN_PRODUCT_SERVICE)
    private readonly adminProductService: IAdminProductService,
  ) {}

  @Get()
  @Permissions('product:read')
  @ApiOperation({ summary: 'Get all products' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name' })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    description: 'Filter by category',
  })
  @ApiQuery({
    name: 'brandId',
    required: false,
    description: 'Filter by brand',
  })
  @ApiQuery({ name: 'shopId', required: false, description: 'Filter by shop' })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiResponse({
    status: 200,
    description: 'List of products',
    type: [ProductListResponseDto],
  })
  async getAllProducts(
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('brandId') brandId?: string,
    @Query('shopId') shopId?: string,
    @Query('status') status?: ProductStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const filter = { search, categoryId, brandId, shopId, status };
    const pagination = {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    };

    const result = await this.adminProductService.getAllProducts(
      filter,
      pagination,
    );

    if (result.isErr()) {
      throw ProductErrorHttpMapper.toHttpException(
        result.error,
        ExceptionSource.CONTROLLER,
      );
    }

    return {
      items: result.value.items.map((p) => new ProductListResponseDto(p)),
      total: result.value.total,
      page: result.value.page,
      limit: result.value.limit,
      totalPages: result.value.totalPages,
    };
  }

  @Get(':id')
  @Permissions('product:read')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({
    status: 200,
    description: 'Product details',
    type: ProductDetailResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getProductById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ProductDetailResponseDto> {
    const result = await this.adminProductService.getProductById(id);

    if (result.isErr()) {
      throw ProductErrorHttpMapper.toHttpException(
        result.error,
        ExceptionSource.CONTROLLER,
      );
    }

    return new ProductDetailResponseDto(result.value);
  }

  @Delete(':id')
  @Permissions('product:delete')
  @ApiOperation({ summary: 'Force delete a product' })
  @ApiResponse({ status: 200, description: 'Product deleted' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async forceDeleteProduct(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    const result = await this.adminProductService.forceDeleteProduct(id);

    if (result.isErr()) {
      throw ProductErrorHttpMapper.toHttpException(
        result.error,
        ExceptionSource.CONTROLLER,
      );
    }

    return { message: 'Product deleted successfully' };
  }
}

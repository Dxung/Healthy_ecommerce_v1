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
  HttpCode,
  HttpStatus,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { SHOP_PRODUCT_SERVICE } from './tokens/product.token';
import { IShopProductService } from './shop-product.service.interface';
import {
  CreateProductArgumentDto,
  UpdateProductArgumentDto,
  CreateVariantArgumentDto,
  UpdateVariantArgumentDto,
  ReorderImagesArgumentDto,
  ProductListResponseDto,
  ProductDetailResponseDto,
  ProductVariantResponseDto,
  ProductImageResponseDto,
} from './dto';
import { ProductErrorHttpMapper } from './errors/product-errors-http.mapper';
import { ExceptionSource } from 'src/common/exception filters/exception-source';
import { FileValidationPipe } from 'src/common/pipes/file-validation.pipe';
import { PRODUCT_IMAGE_CONFIG } from 'src/common/pipes/file-validation.config';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../authorization/guards/permissions.guard';
import { Permissions } from '../authorization/decorators/permissions.decorator';
import { ProductStatus } from 'src/database/typeorm/entities/product/enums/product-status.enum';

@ApiTags('Shop - Products')
@ApiBearerAuth()
@Controller('shop/products')
@UseGuards(AuthGuard, PermissionsGuard)
export class ShopProductController {
  constructor(
    @Inject(SHOP_PRODUCT_SERVICE)
    private readonly shopProductService: IShopProductService,
  ) {}

  // ======================== PRODUCT CRUD ========================

  @Get()
  @Permissions('shop-product:read')
  @ApiOperation({ summary: 'Get my products' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name' })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    description: 'Filter by category',
  })
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
  getMyProducts(
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('status') status?: ProductStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const filter = { search, categoryId, status };
    const pagination = {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    };

    return this.shopProductService.getMyProducts(filter, pagination).match(
      (result) => ({
        items: result.items.map((p) => new ProductListResponseDto(p)),
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      }),
      (error) => {
        throw ProductErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Get(':id')
  @Permissions('shop-product:read')
  @ApiOperation({ summary: 'Get my product by ID' })
  @ApiResponse({
    status: 200,
    description: 'Product details',
    type: ProductDetailResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 403, description: 'Product not owned by your shop' })
  getMyProductById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ProductDetailResponseDto> {
    return this.shopProductService.getMyProductDetailById(id).match(
      (result) =>
        new ProductDetailResponseDto(result.product, {
          servingUnit: result.servingUnit,
          variantUnitMap: result.variantUnitMap,
        }),
      (error) => {
        throw ProductErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Post()
  @Permissions('shop-product:create')
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({
    status: 201,
    description: 'Product created',
    type: ProductDetailResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 403, description: 'User does not have a shop' })
  @ApiResponse({ status: 409, description: 'Slug already exists' })
  createProduct(
    @Body() dto: CreateProductArgumentDto,
  ): Promise<ProductDetailResponseDto> {
    return this.shopProductService.createProduct(dto).match(
      (product) => new ProductDetailResponseDto(product),
      (error) => {
        throw ProductErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Patch(':id')
  @Permissions('shop-product:update')
  @ApiOperation({ summary: 'Update a product' })
  @ApiResponse({
    status: 200,
    description: 'Product updated',
    type: ProductDetailResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 403, description: 'Product not owned / cannot edit' })
  @ApiResponse({ status: 409, description: 'Slug already exists' })
  updateProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductArgumentDto,
  ): Promise<ProductDetailResponseDto> {
    return this.shopProductService.updateProduct(id, dto).match(
      (product) => new ProductDetailResponseDto(product),
      (error) => {
        throw ProductErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Delete(':id')
  @Permissions('shop-product:delete')
  @ApiOperation({ summary: 'Delete a product' })
  @ApiResponse({ status: 200, description: 'Product deleted' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 403, description: 'Product not owned' })
  deleteProduct(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    return this.shopProductService.deleteProduct(id).match(
      () => ({ message: 'Product deleted successfully' }),
      (error) => {
        throw ProductErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  // ======================== PUBLISH / ACTIVATE / DEACTIVATE ========================

  @Post(':id/publish')
  @Permissions('shop-product:publish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Publish a product (draft -> active)' })
  @ApiResponse({
    status: 200,
    description: 'Product published',
    type: ProductDetailResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot publish (no valid variants)',
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  publishProduct(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ProductDetailResponseDto> {
    return this.shopProductService.publishProduct(id).match(
      (product) => new ProductDetailResponseDto(product),
      (error) => {
        throw ProductErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Post(':id/deactivate')
  @Permissions('shop-product:publish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate a product (active -> inactive)' })
  @ApiResponse({
    status: 200,
    description: 'Product deactivated',
    type: ProductDetailResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Cannot deactivate' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  deactivateProduct(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ProductDetailResponseDto> {
    return this.shopProductService.deactivateProduct(id).match(
      (product) => new ProductDetailResponseDto(product),
      (error) => {
        throw ProductErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Post(':id/activate')
  @Permissions('shop-product:publish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate a product (inactive -> active)' })
  @ApiResponse({
    status: 200,
    description: 'Product activated',
    type: ProductDetailResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Cannot activate' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  activateProduct(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ProductDetailResponseDto> {
    return this.shopProductService.activateProduct(id).match(
      (product) => new ProductDetailResponseDto(product),
      (error) => {
        throw ProductErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  // ======================== IMAGE MANAGEMENT ========================

  @Post('images/upload')
  @Permissions('shop-product:update')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({
    summary: 'Upload a product image to Cloudinary',
    description:
      'Uploads an image and returns the URL. Use this URL with POST /:id/images to add to a product. ' +
      'Accepted formats: JPG, PNG, WEBP. Size: 500x500 to 1200x1200 pixels, max 2MB.',
  })
  @ApiResponse({
    status: 200,
    description: 'Image uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        imageUrl: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid image file' })
  uploadImage(
    @UploadedFile(new FileValidationPipe(PRODUCT_IMAGE_CONFIG))
    file: Express.Multer.File,
  ): Promise<{ imageUrl: string }> {
    return this.shopProductService.uploadImage(file).match(
      (imageUrl) => ({ imageUrl }),
      (error) => {
        throw ProductErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Post(':id/images')
  @Permissions('shop-product:update')
  @ApiOperation({ summary: 'Add an image to a product' })
  @ApiResponse({
    status: 201,
    description: 'Image added',
    type: ProductImageResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Image limit exceeded' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  addImage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('imageUrl') imageUrl: string,
  ): Promise<ProductImageResponseDto> {
    return this.shopProductService.addImage(id, imageUrl).match(
      (image) => new ProductImageResponseDto(image),
      (error) => {
        throw ProductErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Delete(':id/images/:imageId')
  @Permissions('shop-product:update')
  @ApiOperation({ summary: 'Remove an image from a product' })
  @ApiResponse({ status: 200, description: 'Image removed' })
  @ApiResponse({ status: 404, description: 'Product or image not found' })
  removeImage(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
  ): Promise<{ message: string }> {
    return this.shopProductService.removeImage(id, imageId).match(
      () => ({ message: 'Image removed successfully' }),
      (error) => {
        throw ProductErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Patch(':id/images/reorder')
  @Permissions('shop-product:update')
  @ApiOperation({ summary: 'Reorder product images' })
  @ApiResponse({ status: 200, description: 'Images reordered' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  reorderImages(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReorderImagesArgumentDto,
  ): Promise<{ message: string }> {
    return this.shopProductService.reorderImages(id, dto.imageIds).match(
      () => ({ message: 'Images reordered successfully' }),
      (error) => {
        throw ProductErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  // ======================== VARIANT MANAGEMENT ========================

  @Post(':id/variants')
  @Permissions('shop-product:update')
  @ApiOperation({ summary: 'Add a variant to a product' })
  @ApiResponse({
    status: 201,
    description: 'Variant added',
    type: ProductVariantResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Cannot edit product' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  addVariant(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateVariantArgumentDto,
  ): Promise<ProductVariantResponseDto> {
    return this.shopProductService.addVariant(id, dto).match(
      (variant) => new ProductVariantResponseDto(variant),
      (error) => {
        throw ProductErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Patch(':id/variants/:variantId')
  @Permissions('shop-product:update')
  @ApiOperation({ summary: 'Update a variant' })
  @ApiResponse({
    status: 200,
    description: 'Variant updated',
    type: ProductVariantResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot edit product / invalid price',
  })
  @ApiResponse({ status: 404, description: 'Product or variant not found' })
  updateVariant(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('variantId', ParseUUIDPipe) variantId: string,
    @Body() dto: UpdateVariantArgumentDto,
  ): Promise<ProductVariantResponseDto> {
    return this.shopProductService.updateVariant(id, variantId, dto).match(
      (variant) => new ProductVariantResponseDto(variant),
      (error) => {
        throw ProductErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Delete(':id/variants/:variantId')
  @Permissions('shop-product:update')
  @ApiOperation({ summary: 'Delete a variant' })
  @ApiResponse({ status: 200, description: 'Variant deleted' })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete last active variant',
  })
  @ApiResponse({ status: 404, description: 'Product or variant not found' })
  deleteVariant(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('variantId', ParseUUIDPipe) variantId: string,
  ): Promise<{ message: string }> {
    return this.shopProductService.deleteVariant(id, variantId).match(
      () => ({ message: 'Variant deleted successfully' }),
      (error) => {
        throw ProductErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }
}

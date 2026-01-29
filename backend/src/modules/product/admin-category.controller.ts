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
import { CATEGORY_SERVICE } from './tokens/product.token';
import { ICategoryService } from './category.service.interface';
import { CreateCategoryArgumentDto } from './dto/category/create-category-argument.dto';
import { UpdateCategoryArgumentDto } from './dto/category/update-category-argument.dto';
import { CategoryResponseDto } from './dto/category/category-response.dto';
import { ProductErrorHttpMapper } from './errors/product-errors-http.mapper';
import { ExceptionSource } from 'src/common/exception filters/exception-source';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../authorization/guards/permissions.guard';
import { Permissions } from '../authorization/decorators/permissions.decorator';

@ApiTags('Admin - Categories')
@ApiBearerAuth()
@Controller('admin/categories')
@UseGuards(AuthGuard, PermissionsGuard)
export class AdminCategoryController {
  constructor(
    @Inject(CATEGORY_SERVICE)
    private readonly categoryService: ICategoryService,
  ) {}

  @Get()
  @Permissions('category:read')
  @ApiOperation({ summary: 'Get all categories' })
  @ApiQuery({
    name: 'activeOnly',
    required: false,
    type: Boolean,
    description: 'Filter by active status',
  })
  @ApiResponse({
    status: 200,
    description: 'List of categories',
    type: [CategoryResponseDto],
  })
  getAllCategories(
    @Query('activeOnly') activeOnly?: string,
  ): Promise<CategoryResponseDto[]> {
    const isActiveOnly = activeOnly === 'true';

    return this.categoryService.getAllCategories(isActiveOnly).match(
      (categories) => CategoryResponseDto.fromList(categories),
      (error) => {
        throw ProductErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Get('hierarchy')
  @Permissions('category:read')
  @ApiOperation({
    summary: 'Get category hierarchy (tree structure) - includes inactive',
  })
  @ApiResponse({
    status: 200,
    description: 'Category tree with children (all statuses)',
    type: [CategoryResponseDto],
  })
  getCategoryHierarchy(): Promise<CategoryResponseDto[]> {
    // Admin sees all categories including inactive ones
    return this.categoryService.getCategoryHierarchy(false).match(
      (categories) => CategoryResponseDto.fromList(categories),
      (error) => {
        throw ProductErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Get(':id')
  @Permissions('category:read')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiResponse({
    status: 200,
    description: 'Category details',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  getCategoryById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CategoryResponseDto> {
    return this.categoryService.getCategoryById(id).match(
      (category) => new CategoryResponseDto(category),
      (error) => {
        throw ProductErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Post()
  @Permissions('category:create')
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({
    status: 201,
    description: 'Category created',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 409, description: 'Slug already exists' })
  createCategory(
    @Body() dto: CreateCategoryArgumentDto,
  ): Promise<CategoryResponseDto> {
    return this.categoryService.createCategory(dto).match(
      (category) => new CategoryResponseDto(category),
      (error) => {
        throw ProductErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Patch(':id')
  @Permissions('category:update')
  @ApiOperation({ summary: 'Update a category' })
  @ApiResponse({
    status: 200,
    description: 'Category updated',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 409, description: 'Slug already exists' })
  updateCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryArgumentDto,
  ): Promise<CategoryResponseDto> {
    return this.categoryService.updateCategory(id, dto).match(
      (category) => new CategoryResponseDto(category),
      (error) => {
        throw ProductErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Delete(':id')
  @Permissions('category:delete')
  @ApiOperation({ summary: 'Delete a category and all its children' })
  @ApiResponse({ status: 200, description: 'Category and children deleted' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  deleteCategory(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    return this.categoryService.deleteCategory(id).match(
      () => ({ message: 'Category deleted successfully' }),
      (error) => {
        throw ProductErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Patch(':id/activate')
  @Permissions('category:update')
  @ApiOperation({ summary: 'Activate a category' })
  @ApiResponse({
    status: 200,
    description: 'Category activated',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  activateCategory(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CategoryResponseDto> {
    return this.categoryService.toggleCategoryStatus(id, true).match(
      (category) => new CategoryResponseDto(category),
      (error) => {
        throw ProductErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Patch(':id/deactivate')
  @Permissions('category:update')
  @ApiOperation({ summary: 'Deactivate a category' })
  @ApiResponse({
    status: 200,
    description: 'Category deactivated',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  deactivateCategory(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CategoryResponseDto> {
    return this.categoryService.toggleCategoryStatus(id, false).match(
      (category) => new CategoryResponseDto(category),
      (error) => {
        throw ProductErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }
}

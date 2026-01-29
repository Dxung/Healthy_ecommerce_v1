import { Controller, Get, Param, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CATEGORY_SERVICE } from './tokens/product.token';
import { ICategoryService } from './category.service.interface';
import { CategoryResponseDto } from './dto/category/category-response.dto';
import { ProductErrorHttpMapper } from './errors/product-errors-http.mapper';
import { ExceptionSource } from 'src/common/exception filters/exception-source';

@ApiTags('Categories')
@Controller('categories')
export class PublicCategoryController {
  constructor(
    @Inject(CATEGORY_SERVICE)
    private readonly categoryService: ICategoryService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all active categories (flat list)' })
  @ApiResponse({
    status: 200,
    description: 'List of active categories',
    type: [CategoryResponseDto],
  })
  getCategories(): Promise<CategoryResponseDto[]> {
    return this.categoryService.getAllCategories(true).match(
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
  @ApiOperation({ summary: 'Get category hierarchy (tree structure)' })
  @ApiResponse({
    status: 200,
    description: 'Category tree with children',
    type: [CategoryResponseDto],
  })
  getCategoryHierarchy(): Promise<CategoryResponseDto[]> {
    return this.categoryService.getCategoryHierarchy().match(
      (categories) => CategoryResponseDto.fromList(categories),
      (error) => {
        throw ProductErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get category by slug' })
  @ApiResponse({
    status: 200,
    description: 'Category details',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  getCategoryBySlug(@Param('slug') slug: string): Promise<CategoryResponseDto> {
    return this.categoryService.getCategoryBySlug(slug).match(
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

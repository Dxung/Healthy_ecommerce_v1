import { Controller, Get, Param, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BRAND_SERVICE } from './tokens/product.token';
import { IBrandService } from './brand.service.interface';
import { BrandResponseDto } from './dto/brand/brand-response.dto';
import { ProductErrorHttpMapper } from './errors/product-errors-http.mapper';
import { ExceptionSource } from 'src/common/exception filters/exception-source';

@ApiTags('Brands')
@Controller('brands')
export class PublicBrandController {
  constructor(
    @Inject(BRAND_SERVICE)
    private readonly brandService: IBrandService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all active brands' })
  @ApiResponse({
    status: 200,
    description: 'List of active brands',
    type: [BrandResponseDto],
  })
  getBrands(): Promise<BrandResponseDto[]> {
    return this.brandService.getAllBrands(true).match(
      (brands) => BrandResponseDto.fromList(brands),
      (error) => {
        throw ProductErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get brand by slug' })
  @ApiResponse({
    status: 200,
    description: 'Brand details',
    type: BrandResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Brand not found' })
  getBrandBySlug(@Param('slug') slug: string): Promise<BrandResponseDto> {
    return this.brandService.getBrandBySlug(slug).match(
      (brand) => new BrandResponseDto(brand),
      (error) => {
        throw ProductErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }
}

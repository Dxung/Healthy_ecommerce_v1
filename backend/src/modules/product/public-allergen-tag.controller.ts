import { Controller, Get, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ALLERGEN_TAG_SERVICE } from './tokens/product.token';
import { IAllergenTagService } from './allergen-tag.service.interface';
import { AllergenTagResponseDto } from './dto/allergen-tag/allergen-tag-response.dto';
import { ProductErrorHttpMapper } from './errors/product-errors-http.mapper';
import { ExceptionSource } from 'src/common/exception filters/exception-source';

@ApiTags('Public - Allergen Tags')
@Controller('allergen-tags')
export class PublicAllergenTagController {
  constructor(
    @Inject(ALLERGEN_TAG_SERVICE)
    private readonly allergenTagService: IAllergenTagService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all active allergen tags (public)' })
  @ApiResponse({
    status: 200,
    description: 'List of active allergen tags',
    type: [AllergenTagResponseDto],
  })
  getActiveAllergenTags(): Promise<AllergenTagResponseDto[]> {
    return this.allergenTagService.getAllAllergenTags(true).match(
      (allergenTags) => AllergenTagResponseDto.fromList(allergenTags),
      (error) => {
        throw ProductErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }
}

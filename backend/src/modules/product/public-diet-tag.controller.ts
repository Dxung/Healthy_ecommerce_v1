import { Controller, Get, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DIET_TAG_SERVICE } from './tokens/product.token';
import { IDietTagService } from './diet-tag.service.interface';
import { DietTagResponseDto } from './dto/diet-tag/diet-tag-response.dto';
import { ProductErrorHttpMapper } from './errors/product-errors-http.mapper';
import { ExceptionSource } from 'src/common/exception filters/exception-source';

@ApiTags('Public - Diet Tags')
@Controller('diet-tags')
export class PublicDietTagController {
  constructor(
    @Inject(DIET_TAG_SERVICE)
    private readonly dietTagService: IDietTagService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all active diet tags (public)' })
  @ApiResponse({
    status: 200,
    description: 'List of active diet tags',
    type: [DietTagResponseDto],
  })
  getActiveDietTags(): Promise<DietTagResponseDto[]> {
    return this.dietTagService.getAllDietTags(true).match(
      (dietTags) => DietTagResponseDto.fromList(dietTags),
      (error) => {
        throw ProductErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }
}

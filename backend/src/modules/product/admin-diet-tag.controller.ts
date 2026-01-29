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
import { DIET_TAG_SERVICE } from './tokens/product.token';
import { IDietTagService } from './diet-tag.service.interface';
import { CreateDietTagArgumentDto } from './dto/diet-tag/create-diet-tag-argument.dto';
import { UpdateDietTagArgumentDto } from './dto/diet-tag/update-diet-tag-argument.dto';
import { DietTagResponseDto } from './dto/diet-tag/diet-tag-response.dto';
import { ProductErrorHttpMapper } from './errors/product-errors-http.mapper';
import { ExceptionSource } from 'src/common/exception filters/exception-source';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../authorization/guards/permissions.guard';
import { Permissions } from '../authorization/decorators/permissions.decorator';

@ApiTags('Admin - Diet Tags')
@ApiBearerAuth()
@Controller('admin/diet-tags')
@UseGuards(AuthGuard, PermissionsGuard)
export class AdminDietTagController {
  constructor(
    @Inject(DIET_TAG_SERVICE)
    private readonly dietTagService: IDietTagService,
  ) {}

  @Get()
  @Permissions('diet-tag:read')
  @ApiOperation({ summary: 'Get all diet tags' })
  @ApiQuery({
    name: 'activeOnly',
    required: false,
    type: Boolean,
    description: 'Filter by active status',
  })
  @ApiResponse({
    status: 200,
    description: 'List of diet tags',
    type: [DietTagResponseDto],
  })
  getAllDietTags(
    @Query('activeOnly') activeOnly?: string,
  ): Promise<DietTagResponseDto[]> {
    const isActiveOnly = activeOnly === 'true';

    return this.dietTagService.getAllDietTags(isActiveOnly).match(
      (dietTags) => DietTagResponseDto.fromList(dietTags),
      (error) => {
        throw ProductErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Get(':id')
  @Permissions('diet-tag:read')
  @ApiOperation({ summary: 'Get diet tag by ID' })
  @ApiResponse({
    status: 200,
    description: 'Diet tag details',
    type: DietTagResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Diet tag not found' })
  getDietTagById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<DietTagResponseDto> {
    return this.dietTagService.getDietTagById(id).match(
      (dietTag) => new DietTagResponseDto(dietTag),
      (error) => {
        throw ProductErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Post()
  @Permissions('diet-tag:create')
  @ApiOperation({ summary: 'Create a new diet tag' })
  @ApiResponse({
    status: 201,
    description: 'Diet tag created',
    type: DietTagResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 409, description: 'Slug already exists' })
  createDietTag(
    @Body() dto: CreateDietTagArgumentDto,
  ): Promise<DietTagResponseDto> {
    return this.dietTagService.createDietTag(dto).match(
      (dietTag) => new DietTagResponseDto(dietTag),
      (error) => {
        throw ProductErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Patch(':id')
  @Permissions('diet-tag:update')
  @ApiOperation({ summary: 'Update a diet tag' })
  @ApiResponse({
    status: 200,
    description: 'Diet tag updated',
    type: DietTagResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Diet tag not found' })
  @ApiResponse({ status: 409, description: 'Slug already exists' })
  updateDietTag(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDietTagArgumentDto,
  ): Promise<DietTagResponseDto> {
    return this.dietTagService.updateDietTag(id, dto).match(
      (dietTag) => new DietTagResponseDto(dietTag),
      (error) => {
        throw ProductErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Delete(':id')
  @Permissions('diet-tag:delete')
  @ApiOperation({ summary: 'Delete a diet tag' })
  @ApiResponse({ status: 200, description: 'Diet tag deleted' })
  @ApiResponse({ status: 404, description: 'Diet tag not found' })
  @ApiResponse({ status: 409, description: 'Diet tag is in use' })
  deleteDietTag(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    return this.dietTagService.deleteDietTag(id).match(
      () => ({ message: 'Diet tag deleted successfully' }),
      (error) => {
        throw ProductErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }
}

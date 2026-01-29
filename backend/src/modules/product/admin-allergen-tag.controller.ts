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
import { ALLERGEN_TAG_SERVICE } from './tokens/product.token';
import { IAllergenTagService } from './allergen-tag.service.interface';
import { CreateAllergenTagArgumentDto } from './dto/allergen-tag/create-allergen-tag-argument.dto';
import { UpdateAllergenTagArgumentDto } from './dto/allergen-tag/update-allergen-tag-argument.dto';
import { AllergenTagResponseDto } from './dto/allergen-tag/allergen-tag-response.dto';
import { ProductErrorHttpMapper } from './errors/product-errors-http.mapper';
import { ExceptionSource } from 'src/common/exception filters/exception-source';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../authorization/guards/permissions.guard';
import { Permissions } from '../authorization/decorators/permissions.decorator';

@ApiTags('Admin - Allergen Tags')
@ApiBearerAuth()
@Controller('admin/allergen-tags')
@UseGuards(AuthGuard, PermissionsGuard)
export class AdminAllergenTagController {
  constructor(
    @Inject(ALLERGEN_TAG_SERVICE)
    private readonly allergenTagService: IAllergenTagService,
  ) {}

  @Get()
  @Permissions('allergen-tag:read')
  @ApiOperation({ summary: 'Get all allergen tags' })
  @ApiQuery({
    name: 'activeOnly',
    required: false,
    type: Boolean,
    description: 'Filter by active status',
  })
  @ApiResponse({
    status: 200,
    description: 'List of allergen tags',
    type: [AllergenTagResponseDto],
  })
  getAllAllergenTags(
    @Query('activeOnly') activeOnly?: string,
  ): Promise<AllergenTagResponseDto[]> {
    const isActiveOnly = activeOnly === 'true';

    return this.allergenTagService.getAllAllergenTags(isActiveOnly).match(
      (allergenTags) => AllergenTagResponseDto.fromList(allergenTags),
      (error) => {
        throw ProductErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Get(':id')
  @Permissions('allergen-tag:read')
  @ApiOperation({ summary: 'Get allergen tag by ID' })
  @ApiResponse({
    status: 200,
    description: 'Allergen tag details',
    type: AllergenTagResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Allergen tag not found' })
  getAllergenTagById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AllergenTagResponseDto> {
    return this.allergenTagService.getAllergenTagById(id).match(
      (allergenTag) => new AllergenTagResponseDto(allergenTag),
      (error) => {
        throw ProductErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Post()
  @Permissions('allergen-tag:create')
  @ApiOperation({ summary: 'Create a new allergen tag' })
  @ApiResponse({
    status: 201,
    description: 'Allergen tag created',
    type: AllergenTagResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 409, description: 'Slug already exists' })
  createAllergenTag(
    @Body() dto: CreateAllergenTagArgumentDto,
  ): Promise<AllergenTagResponseDto> {
    return this.allergenTagService.createAllergenTag(dto).match(
      (allergenTag) => new AllergenTagResponseDto(allergenTag),
      (error) => {
        throw ProductErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Patch(':id')
  @Permissions('allergen-tag:update')
  @ApiOperation({ summary: 'Update an allergen tag' })
  @ApiResponse({
    status: 200,
    description: 'Allergen tag updated',
    type: AllergenTagResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Allergen tag not found' })
  @ApiResponse({ status: 409, description: 'Slug already exists' })
  updateAllergenTag(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAllergenTagArgumentDto,
  ): Promise<AllergenTagResponseDto> {
    return this.allergenTagService.updateAllergenTag(id, dto).match(
      (allergenTag) => new AllergenTagResponseDto(allergenTag),
      (error) => {
        throw ProductErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Delete(':id')
  @Permissions('allergen-tag:delete')
  @ApiOperation({ summary: 'Delete an allergen tag' })
  @ApiResponse({ status: 200, description: 'Allergen tag deleted' })
  @ApiResponse({ status: 404, description: 'Allergen tag not found' })
  @ApiResponse({ status: 409, description: 'Allergen tag is in use' })
  deleteAllergenTag(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    return this.allergenTagService.deleteAllergenTag(id).match(
      () => ({ message: 'Allergen tag deleted successfully' }),
      (error) => {
        throw ProductErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }
}

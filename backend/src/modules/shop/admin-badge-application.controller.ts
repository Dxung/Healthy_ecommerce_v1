import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { IBadgeApplicationService } from './badge-application.service.interface';
import { BADGE_APPLICATION_SERVICE } from './tokens/shop.token';
import {
  BadgeApplicationResponseDto,
  BadgeApplicationListQueryDto,
  RejectBadgeApplicationArgumentDto,
  AddBrandRequirementArgumentDto,
  BrandDocumentRequirementResponseDto,
} from './dto';
import { ExceptionSource } from 'src/common/exception filters/exception-source';
import { ShopErrorHttpMapper } from './errors/shop-errors-http.mapper';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../authorization/guards/permissions.guard';
import { Permissions } from '../authorization/decorators/permissions.decorator';
import { PaginatedResult } from 'src/shared/types/pagination.type';

/**
 * Admin controller for badge application management.
 * Route: /admin/badge-applications
 */
@ApiTags('Admin - Badge Applications')
@Controller('admin')
export class AdminBadgeApplicationController {
  constructor(
    @Inject(BADGE_APPLICATION_SERVICE)
    private readonly badgeApplicationService: IBadgeApplicationService,
  ) {}

  //================================================== BADGE APPLICATIONS ==================================================

  /**
   * Gets all badge applications with filters and pagination.
   */
  @Get('badge-applications')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions('admin:badge-application:read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all badge applications (admin)' })
  @ApiResponse({ status: 200, description: 'List of badge applications' })
  async getAllApplications(
    @Query() query: BadgeApplicationListQueryDto,
  ): Promise<PaginatedResult<BadgeApplicationResponseDto>> {
    const filters = {
      status: query.status,
      applicationType: query.applicationType,
    };
    const pagination = {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
    };

    return this.badgeApplicationService
      .getAllApplications(filters, pagination)
      .match(
        (result) => ({
          ...result,
          items: result.items.map((app) =>
            BadgeApplicationResponseDto.fromDomain(app),
          ),
        }),
        (error) => {
          throw ShopErrorHttpMapper.toHttpException(
            error,
            ExceptionSource.CONTROLLER,
          );
        },
      );
  }

  /**
   * Gets a badge application by ID.
   */
  @Get('badge-applications/:id')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions('admin:badge-application:read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get badge application by ID (admin)' })
  @ApiResponse({ status: 200, type: BadgeApplicationResponseDto })
  async getApplicationById(
    @Param('id') id: string,
  ): Promise<BadgeApplicationResponseDto> {
    return this.badgeApplicationService.getApplicationById(id).match(
      (application) => BadgeApplicationResponseDto.fromDomain(application),
      (error) => {
        throw ShopErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  /**
   * Approves a badge application.
   */
  @Post('badge-applications/:id/approve')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions('admin:badge-application:approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve badge application (admin)' })
  @ApiResponse({
    status: 200,
    description: 'Application approved',
    type: BadgeApplicationResponseDto,
  })
  async approveApplication(
    @Param('id') id: string,
  ): Promise<BadgeApplicationResponseDto> {
    return this.badgeApplicationService.approveApplication(id).match(
      (application) => BadgeApplicationResponseDto.fromDomain(application),
      (error) => {
        throw ShopErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  /**
   * Rejects a badge application.
   */
  @Post('badge-applications/:id/reject')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions('admin:badge-application:reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject badge application (admin)' })
  @ApiResponse({
    status: 200,
    description: 'Application rejected',
    type: BadgeApplicationResponseDto,
  })
  async rejectApplication(
    @Param('id') id: string,
    @Body() dto: RejectBadgeApplicationArgumentDto,
  ): Promise<BadgeApplicationResponseDto> {
    return this.badgeApplicationService.rejectApplication(id, dto.reason).match(
      (application) => BadgeApplicationResponseDto.fromDomain(application),
      (error) => {
        throw ShopErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  //================================================== BRAND DOCUMENT REQUIREMENTS ==================================================

  /**
   * Gets document requirements for a brand.
   */
  @Get('brands/:brandId/document-requirements')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions('admin:brand:read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get brand document requirements (admin)' })
  @ApiResponse({ status: 200, type: [BrandDocumentRequirementResponseDto] })
  async getBrandDocumentRequirements(
    @Param('brandId') brandId: string,
  ): Promise<BrandDocumentRequirementResponseDto[]> {
    return this.badgeApplicationService
      .getBrandDocumentRequirements(brandId)
      .match(
        (requirements) =>
          requirements.map((r) =>
            BrandDocumentRequirementResponseDto.fromDomain(r),
          ),
        (error) => {
          throw ShopErrorHttpMapper.toHttpException(
            error,
            ExceptionSource.CONTROLLER,
          );
        },
      );
  }

  /**
   * Adds a document requirement to a brand.
   */
  @Post('brands/:brandId/document-requirements')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions('admin:brand:update')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add document requirement to brand (admin)' })
  @ApiResponse({ status: 201, type: BrandDocumentRequirementResponseDto })
  async addBrandDocumentRequirement(
    @Param('brandId') brandId: string,
    @Body() dto: AddBrandRequirementArgumentDto,
  ): Promise<BrandDocumentRequirementResponseDto> {
    return this.badgeApplicationService
      .addBrandDocumentRequirement(brandId, dto)
      .match(
        (requirement) =>
          BrandDocumentRequirementResponseDto.fromDomain(requirement),
        (error) => {
          throw ShopErrorHttpMapper.toHttpException(
            error,
            ExceptionSource.CONTROLLER,
          );
        },
      );
  }

  /**
   * Removes a document requirement from a brand.
   */
  @Delete('brands/:brandId/document-requirements/:requirementId')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions('admin:brand:update')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove document requirement from brand (admin)' })
  @ApiResponse({ status: 204, description: 'Requirement removed' })
  async removeBrandDocumentRequirement(
    @Param('requirementId') requirementId: string,
  ): Promise<void> {
    return this.badgeApplicationService
      .removeBrandDocumentRequirement(requirementId)
      .match(
        () => undefined,
        (error) => {
          throw ShopErrorHttpMapper.toHttpException(
            error,
            ExceptionSource.CONTROLLER,
          );
        },
      );
  }
}

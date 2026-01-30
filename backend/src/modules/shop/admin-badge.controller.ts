import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { IAdminBadgeService } from './admin-badge.service.interface';
import { ADMIN_BADGE_SERVICE } from './tokens/shop.token';
import { ShopBadgeCode } from 'src/database/typeorm/entities/shop/enums/shop-badge-code.enum';
import {
  BadgeResponseDto,
  BadgeDetailResponseDto,
  BadgeRequirementResponseDto,
  DocumentTypeResponseDto,
  CreateDocumentTypeArgumentDto,
  UpdateDocumentTypeArgumentDto,
  AddRequirementArgumentDto,
  UpdateBadgeArgumentDto,
} from './dto';
import { ExceptionSource } from 'src/common/exception filters/exception-source';
import { ShopErrorHttpMapper } from './errors/shop-errors-http.mapper';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../authorization/guards/permissions.guard';
import { Permissions } from '../authorization/decorators/permissions.decorator';

/**
 * Controller responsible for admin badge management.
 * Route: /admin/badges
 */
@ApiTags('Admin - Badges')
@Controller('admin/badges')
@UseGuards(AuthGuard, PermissionsGuard)
export class AdminBadgeController {
  constructor(
    @Inject(ADMIN_BADGE_SERVICE)
    private readonly adminBadgeService: IAdminBadgeService,
  ) {}

  // ======================== BADGE ENDPOINTS ========================

  /**
   * Gets all badges with their requirement counts.
   */
  @Get()
  @Permissions('badge:manage')
  @HttpCode(HttpStatus.OK)
  async getAllBadges(): Promise<BadgeResponseDto[]> {
    return this.adminBadgeService.getAllBadges().match(
      (badges) => badges.map((badge) => new BadgeResponseDto(badge)),
      (error) => {
        throw ShopErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  /**
   * Gets a badge by code with full details including requirements.
   */
  @Get(':code')
  @Permissions('badge:manage')
  @HttpCode(HttpStatus.OK)
  async getBadgeByCode(
    @Param('code') code: ShopBadgeCode,
  ): Promise<BadgeDetailResponseDto> {
    return this.adminBadgeService.getBadgeByCode(code).match(
      (badge) => new BadgeDetailResponseDto(badge),
      (error) => {
        throw ShopErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  /**
   * Toggles a badge's active status.
   */
  @Patch(':code/toggle-active')
  @Permissions('badge:manage')
  @HttpCode(HttpStatus.OK)
  async toggleBadgeActive(
    @Param('code') code: ShopBadgeCode,
  ): Promise<BadgeResponseDto> {
    return this.adminBadgeService.toggleBadgeActive(code).match(
      (badge) => new BadgeResponseDto(badge),
      (error) => {
        throw ShopErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  /**
   * Updates a badge's properties.
   */
  @Patch(':code')
  @Permissions('badge:manage')
  @HttpCode(HttpStatus.OK)
  async updateBadge(
    @Param('code') code: ShopBadgeCode,
    @Body() dto: UpdateBadgeArgumentDto,
  ): Promise<BadgeResponseDto> {
    return this.adminBadgeService.updateBadge(code, dto).match(
      (badge) => new BadgeResponseDto(badge),
      (error) => {
        throw ShopErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  // ======================== REQUIREMENT ENDPOINTS ========================

  /**
   * Adds a requirement to a badge.
   */
  @Post(':code/requirements')
  @Permissions('badge:manage')
  @HttpCode(HttpStatus.CREATED)
  async addRequirement(
    @Param('code') code: ShopBadgeCode,
    @Body() dto: AddRequirementArgumentDto,
  ): Promise<BadgeRequirementResponseDto> {
    return this.adminBadgeService.addRequirement(code, dto).match(
      (requirement) => new BadgeRequirementResponseDto(requirement),
      (error) => {
        throw ShopErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  /**
   * Removes a requirement from a badge.
   */
  @Delete('requirements/:id')
  @Permissions('badge:manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeRequirement(@Param('id') id: string): Promise<void> {
    return this.adminBadgeService.removeRequirement(id).match(
      () => undefined,
      (error) => {
        throw ShopErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  /**
   * Toggles a requirement's active status.
   */
  @Patch('requirements/:id/toggle-active')
  @Permissions('badge:manage')
  @HttpCode(HttpStatus.OK)
  async toggleRequirementActive(
    @Param('id') id: string,
  ): Promise<BadgeRequirementResponseDto> {
    return this.adminBadgeService.toggleRequirementActive(id).match(
      (requirement) => new BadgeRequirementResponseDto(requirement),
      (error) => {
        throw ShopErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }
}

/**
 * Controller responsible for admin document type management.
 * Route: /admin/document-types
 */
@ApiTags('Admin - Document Types')
@Controller('admin/document-types')
@UseGuards(AuthGuard, PermissionsGuard)
export class AdminDocumentTypeController {
  constructor(
    @Inject(ADMIN_BADGE_SERVICE)
    private readonly adminBadgeService: IAdminBadgeService,
  ) {}

  /**
   * Gets all document types with their applied badge names.
   */
  @Get()
  @Permissions('badge:manage')
  @HttpCode(HttpStatus.OK)
  async getAllDocumentTypes(): Promise<DocumentTypeResponseDto[]> {
    return this.adminBadgeService.getAllDocumentTypesWithAppliedBadges().match(
      (results) =>
        results.map(
          ({ documentType, appliedBadges }) =>
            new DocumentTypeResponseDto(documentType, appliedBadges),
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
   * Creates a new document type.
   */
  @Post()
  @Permissions('badge:manage')
  @HttpCode(HttpStatus.CREATED)
  async createDocumentType(
    @Body() dto: CreateDocumentTypeArgumentDto,
  ): Promise<DocumentTypeResponseDto> {
    return this.adminBadgeService.createDocumentType(dto).match(
      (docType) => new DocumentTypeResponseDto(docType),
      (error) => {
        throw ShopErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  /**
   * Updates a document type.
   */
  @Patch(':id')
  @Permissions('badge:manage')
  @HttpCode(HttpStatus.OK)
  async updateDocumentType(
    @Param('id') id: string,
    @Body() dto: UpdateDocumentTypeArgumentDto,
  ): Promise<DocumentTypeResponseDto> {
    return this.adminBadgeService.updateDocumentType(id, dto).match(
      (docType) => new DocumentTypeResponseDto(docType),
      (error) => {
        throw ShopErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  /**
   * Deletes a document type (soft delete).
   */
  @Delete(':id')
  @Permissions('badge:manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDocumentType(@Param('id') id: string): Promise<void> {
    return this.adminBadgeService.deleteDocumentType(id).match(
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

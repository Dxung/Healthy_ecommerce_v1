import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { IBadgeApplicationService } from './badge-application.service.interface';
import type { IShopService } from './shop.service.interface';
import { BADGE_APPLICATION_SERVICE, SHOP_SERVICE } from './tokens/shop.token';
import {
  RegisterShopArgumentDto,
  ApplyVerifiedBadgeArgumentDto,
  ApplyOfficialBadgeArgumentDto,
  BadgeApplicationResponseDto,
  BadgeApplicationListItemDto,
  ShopOfficialBrandResponseDto,
  ShopInfoResponseDto,
} from './dto';
import { ShopBadgeAssignmentResponseDto } from './dto/badge-response.dto';
import { ExceptionSource } from 'src/common/exception filters/exception-source';
import { ShopErrorHttpMapper } from './errors/shop-errors-http.mapper';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../authorization/guards/permissions.guard';
import { Permissions } from '../authorization/decorators/permissions.decorator';

/**
 * Controller for shop registration and badge application operations.
 * Route: /shop
 */
@ApiTags('Shop')
@Controller('shop')
export class BadgeApplicationController {
  constructor(
    @Inject(BADGE_APPLICATION_SERVICE)
    private readonly badgeApplicationService: IBadgeApplicationService,
    @Inject(SHOP_SERVICE)
    private readonly shopService: IShopService,
  ) {}

  //================================================== SINGLE-STEP SHOP REGISTRATION ==================================================

  /**
   * Registers a new shop (single-step, no admin approval required).
   * Creates shop immediately with ACTIVE status.
   */
  @Post('register')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions('shop:register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new shop (single-step)' })
  @ApiResponse({
    status: 201,
    description: 'Shop created successfully',
    type: ShopInfoResponseDto,
  })
  async registerShop(
    @Body() dto: RegisterShopArgumentDto,
  ): Promise<ShopInfoResponseDto> {
    return this.shopService.registerShop(dto).match(
      (shop) => new ShopInfoResponseDto(shop),
      (error) => {
        throw ShopErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  //================================================== BADGE APPLICATIONS ==================================================

  /**
   * Gets document requirements for Verified badge application.
   */
  @Get('badge-applications/verified/requirements')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get Verified badge requirements' })
  async getVerifiedRequirements() {
    return this.badgeApplicationService.getVerifiedRequirements().match(
      (requirements) => requirements,
      (error) => {
        throw ShopErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  /**
   * Applies for Verified badge.
   */
  @Post('badge-applications/verified')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions('shop:badge:apply')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Apply for Verified badge' })
  @ApiResponse({
    status: 201,
    description: 'Application submitted',
    type: BadgeApplicationResponseDto,
  })
  async applyForVerifiedBadge(
    @Body() dto: ApplyVerifiedBadgeArgumentDto,
  ): Promise<BadgeApplicationResponseDto> {
    return this.badgeApplicationService.applyForVerifiedBadge(dto).match(
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
   * Gets document requirements for Official badge application.
   * Same requirements for all brands.
   */
  @Get('badge-applications/official/requirements')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get Official badge requirements' })
  async getOfficialRequirements() {
    return this.badgeApplicationService.getOfficialRequirements().match(
      (requirements) => requirements,
      (error) => {
        throw ShopErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  /**
   * Applies for Official badge for a specific brand.
   */
  @Post('badge-applications/official')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions('shop:badge:apply')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Apply for Official badge for a brand' })
  @ApiResponse({
    status: 201,
    description: 'Application submitted',
    type: BadgeApplicationResponseDto,
  })
  async applyForOfficialBadge(
    @Body() dto: ApplyOfficialBadgeArgumentDto,
  ): Promise<BadgeApplicationResponseDto> {
    return this.badgeApplicationService.applyForOfficialBadge(dto).match(
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
   * Gets all badge applications for the current shop.
   */
  @Get('badge-applications')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get my badge applications' })
  @ApiResponse({ status: 200, type: [BadgeApplicationListItemDto] })
  async getMyApplications(): Promise<BadgeApplicationListItemDto[]> {
    return this.badgeApplicationService.getMyApplications().match(
      (applications) =>
        applications.map((app) => BadgeApplicationListItemDto.fromDomain(app)),
      (error) => {
        throw ShopErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  /**
   * Cancels a pending badge application.
   */
  @Post('badge-applications/:id/cancel')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions('shop:badge:apply')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a pending badge application' })
  @ApiResponse({
    status: 200,
    description: 'Application cancelled',
    type: BadgeApplicationResponseDto,
  })
  async cancelApplication(
    @Param('id') id: string,
  ): Promise<BadgeApplicationResponseDto> {
    return this.badgeApplicationService.cancelApplication(id).match(
      (application) => BadgeApplicationResponseDto.fromDomain(application),
      (error) => {
        throw ShopErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  //================================================== BADGES & OFFICIAL BRANDS ==================================================

  /**
   * Gets the current shop's badges.
   */
  @Get('badges')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get my shop badges' })
  @ApiResponse({ status: 200, type: [ShopBadgeAssignmentResponseDto] })
  async getMyBadges(): Promise<ShopBadgeAssignmentResponseDto[]> {
    return this.badgeApplicationService.getMyBadges().match(
      (badges) =>
        badges.map((b) => ShopBadgeAssignmentResponseDto.fromDomain(b)),
      (error) => {
        throw ShopErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  /**
   * Gets the current shop's official brands.
   */
  @Get('official-brands')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get my official brands' })
  @ApiResponse({ status: 200, type: [ShopOfficialBrandResponseDto] })
  async getMyOfficialBrands(): Promise<ShopOfficialBrandResponseDto[]> {
    return this.badgeApplicationService.getMyOfficialBrands().match(
      (brands) => brands.map((b) => ShopOfficialBrandResponseDto.fromDomain(b)),
      (error) => {
        throw ShopErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }
}

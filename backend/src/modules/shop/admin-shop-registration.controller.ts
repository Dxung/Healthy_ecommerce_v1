import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { IShopService } from './shop.service.interface';
import { SHOP_SERVICE } from './tokens/shop.token';
import { ShopRegistrationStatus } from 'src/database/typeorm/entities/shop/enums/shop-registration-status.enum';
import {
  ApproveRegistrationArgumentDto,
  RejectRegistrationArgumentDto,
  RegistrationListResponseDto,
  RegistrationDetailResponseDto,
} from './dto';
import { ExceptionSource } from 'src/common/exception filters/exception-source';
import { ShopErrorHttpMapper } from './errors/shop-errors-http.mapper';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../authorization/guards/permissions.guard';
import { Permissions } from '../authorization/decorators/permissions.decorator';

/**
 * Controller responsible for admin shop registration management.
 * Route: /admin/shop-registrations
 */
@ApiTags('Admin - Shop Registrations')
@Controller('admin/shop-registrations')
@UseGuards(AuthGuard, PermissionsGuard)
export class AdminShopRegistrationController {
  constructor(
    @Inject(SHOP_SERVICE)
    private readonly shopService: IShopService,
  ) {}

  //================================================== LIST & VIEW ==================================================

  /**
   * Gets all shop registration requests with optional status filter.
   * @param status - Optional status filter (pending, approved, rejected)
   * @returns Promise that resolves to array of RegistrationListResponseDto
   */
  @Get()
  @Permissions('shop:approve')
  @HttpCode(HttpStatus.OK)
  async getRegistrations(
    @Query('status') status?: ShopRegistrationStatus,
  ): Promise<RegistrationListResponseDto[]> {
    return this.shopService.getRegistrations(status).match(
      (registrations) =>
        registrations.map((reg) => new RegistrationListResponseDto(reg)),
      (error) => {
        throw ShopErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  /**
   * Gets a single shop registration request by ID with full details.
   * @param id - The registration ID
   * @returns Promise that resolves to RegistrationDetailResponseDto
   */
  @Get(':id')
  @Permissions('shop:approve')
  @HttpCode(HttpStatus.OK)
  async getRegistrationById(
    @Param('id') id: string,
  ): Promise<RegistrationDetailResponseDto> {
    return this.shopService.getRegistrationById(id).match(
      ({ registration, locationNames }) =>
        new RegistrationDetailResponseDto(registration, locationNames),
      (error) => {
        throw ShopErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  //================================================== APPROVE & REJECT ==================================================

  /**
   * Approves a shop registration request.
   * Can approve shop only or shop + badge based on dto options.
   * @param id - The registration ID to approve
   * @param dto - ApproveRegistrationArgumentDto with approval options
   * @returns Promise that resolves to void
   */
  @Post(':id/approve')
  @Permissions('shop:approve')
  @HttpCode(HttpStatus.NO_CONTENT)
  async approveRegistration(
    @Param('id') id: string,
    @Body() dto: ApproveRegistrationArgumentDto,
  ): Promise<void> {
    return this.shopService.approveRegistration(id, dto).match(
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
   * Rejects a shop registration request.
   * @param id - The registration ID to reject
   * @param dto - RejectRegistrationArgumentDto with rejection reason
   * @returns Promise that resolves to void
   */
  @Post(':id/reject')
  @Permissions('shop:approve')
  @HttpCode(HttpStatus.NO_CONTENT)
  async rejectRegistration(
    @Param('id') id: string,
    @Body() dto: RejectRegistrationArgumentDto,
  ): Promise<void> {
    return this.shopService.rejectRegistration(id, dto.reason).match(
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

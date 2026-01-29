import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { IShopService } from './shop.service.interface';
import { SHOP_SERVICE } from './tokens/shop.token';
import {
  InitShopRegistrationArgumentDto,
  InitShopRegistrationResponseDto,
  CompleteShopRegistrationArgumentDto,
  RegistrationStatusResponseDto,
  ShopInfoResponseDto,
} from './dto';
import { ExceptionSource } from 'src/common/exception filters/exception-source';
import { ShopErrorHttpMapper } from './errors/shop-errors-http.mapper';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../authorization/guards/permissions.guard';
import { Permissions } from '../authorization/decorators/permissions.decorator';

/**
 * Controller responsible for handling buyer shop registration requests.
 * Route: /shop
 */
@ApiTags('Shop')
@Controller('shop')
export class ShopController {
  constructor(
    @Inject(SHOP_SERVICE)
    private readonly shopService: IShopService,
  ) {}

  //================================================== SHOP REGISTRATION (2-PHASE) ==================================================

  /**
   * Phase 1: Initializes shop registration.
   * Verifies Firebase OTP, validates shop info, and returns internal token.
   * Token is valid for 30 minutes.
   * @param dto - InitShopRegistrationArgumentDto with basic shop info and Firebase OTP token
   * @returns Promise that resolves to InitShopRegistrationResponseDto with internal token
   */
  @Post('register/init')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions('shop:register')
  @HttpCode(HttpStatus.OK)
  async initRegistration(
    @Body() dto: InitShopRegistrationArgumentDto,
  ): Promise<InitShopRegistrationResponseDto> {
    return this.shopService.initRegistration(dto).match(
      (result) => new InitShopRegistrationResponseDto(result.token),
      (error) => {
        throw ShopErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  /**
   * Phase 2: Completes shop registration with documents.
   * Uses internal token from Phase 1, submits badge choice and documents.
   * @param dto - CompleteShopRegistrationArgumentDto with token and optional documents
   * @returns Promise that resolves to RegistrationStatusResponseDto
   */
  @Post('register/complete')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions('shop:register')
  @HttpCode(HttpStatus.CREATED)
  async completeRegistration(
    @Body() dto: CompleteShopRegistrationArgumentDto,
  ): Promise<RegistrationStatusResponseDto> {
    return this.shopService.completeRegistration(dto).match(
      (registration) => new RegistrationStatusResponseDto(registration),
      (error) => {
        throw ShopErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  /**
   * Gets the current user's most recent shop registration request.
   * Returns null if user has no registration.
   * @returns Promise that resolves to RegistrationStatusResponseDto or null
   */
  @Get('my-registration')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async getMyRegistration(): Promise<RegistrationStatusResponseDto | null> {
    return this.shopService.getMyRegistration().match(
      (registration) =>
        registration ? new RegistrationStatusResponseDto(registration) : null,
      (error) => {
        throw ShopErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  /**
   * Gets the current user's shop information.
   * Returns null if user doesn't own a shop.
   * @returns Promise that resolves to ShopInfoResponseDto or null
   */
  @Get('my-shop')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async getMyShop(): Promise<ShopInfoResponseDto | null> {
    return this.shopService.getMyShop().match(
      (shop) => (shop ? new ShopInfoResponseDto(shop) : null),
      (error) => {
        throw ShopErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }
}

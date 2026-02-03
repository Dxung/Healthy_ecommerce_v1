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
import { RegisterShopArgumentDto, ShopInfoResponseDto } from './dto';
import { ProductSlotsInfoResponseDto } from './dto/product-slots-info-response.dto';
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

  //================================================== SHOP REGISTRATION ==================================================

  /**
   * Registers a new shop for the current user.
   * Shop is created immediately without admin approval.
   * @param dto - RegisterShopArgumentDto with shop info and optional Firebase OTP token
   * @returns Promise that resolves to ShopInfoResponseDto
   */
  @Post('register')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions('shop:register')
  @HttpCode(HttpStatus.CREATED)
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

  /**
   * Gets the current shop's product slots information.
   * @returns Promise that resolves to ProductSlotsInfoResponseDto
   */
  @Get('product-slots')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions('shop:read-product')
  @HttpCode(HttpStatus.OK)
  async getProductSlotsInfo(): Promise<ProductSlotsInfoResponseDto> {
    return this.shopService.getProductSlotsInfo().match(
      (info) => new ProductSlotsInfoResponseDto(info.currentCount, info.maxSlots),
      (error) => {
        throw ShopErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }
}

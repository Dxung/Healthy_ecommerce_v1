import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  Inject,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { IAdminShopService } from './admin-shop.service.interface';
import { ADMIN_SHOP_SERVICE } from './tokens/shop.token';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../authorization/guards/permissions.guard';
import { Permissions } from '../authorization/decorators/permissions.decorator';
import { ShopErrorHttpMapper } from './errors/shop-errors-http.mapper';
import { ExceptionSource } from 'src/common/exception filters/exception-source';
import { AdminShopListQueryDto } from './dto/admin-shop-list-query.dto';
import {
  AdminShopResponseDto,
  AdminShopListResponseDto,
} from './dto/admin-shop-response.dto';
import {
  SuspendShopArgumentDto,
  BanShopArgumentDto,
} from './dto/admin-shop-action-argument.dto';

@ApiTags('Admin - Shop Management')
@Controller('admin/shops')
@UseGuards(AuthGuard, PermissionsGuard)
export class AdminShopController {
  constructor(
    @Inject(ADMIN_SHOP_SERVICE)
    private readonly adminShopService: IAdminShopService,
  ) {}

  @Get()
  @Permissions('shop:read')
  @ApiOperation({ summary: 'Get all shops with pagination and filters' })
  @ApiResponse({
    status: 200,
    description: 'List of shops',
    type: AdminShopListResponseDto,
  })
  getAllShops(
    @Query() query: AdminShopListQueryDto,
  ): Promise<AdminShopListResponseDto> {
    const filters = {
      status: query.status,
      search: query.search,
      isAdminSuspended: query.isAdminSuspended,
    };
    const pagination = {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
    };

    return this.adminShopService.getAllShops(filters, pagination).match(
      (result) => new AdminShopListResponseDto(result),
      (error) => {
        throw ShopErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Get(':id')
  @Permissions('shop:read')
  @ApiOperation({ summary: 'Get shop by ID' })
  @ApiResponse({
    status: 200,
    description: 'Shop details',
    type: AdminShopResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  getShopById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AdminShopResponseDto> {
    return this.adminShopService.getShopById(id).match(
      (shop) => new AdminShopResponseDto(shop),
      (error) => {
        throw ShopErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Post(':id/suspend')
  @Permissions('shop:manage')
  @ApiOperation({ summary: 'Suspend a shop (admin action)' })
  @ApiResponse({ status: 200, description: 'Shop suspended successfully' })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  @ApiResponse({ status: 409, description: 'Shop already suspended or banned' })
  suspendShop(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SuspendShopArgumentDto,
  ): Promise<{ success: boolean; message: string }> {
    return this.adminShopService.suspendShop(id, dto.reason).match(
      () => ({ success: true, message: 'Cửa hàng đã bị đình chỉ.' }),
      (error) => {
        throw ShopErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Post(':id/unsuspend')
  @Permissions('shop:manage')
  @ApiOperation({ summary: 'Unsuspend a shop (admin action)' })
  @ApiResponse({ status: 200, description: 'Shop unsuspended successfully' })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  @ApiResponse({
    status: 409,
    description: 'Shop is not suspended or is banned',
  })
  unsuspendShop(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.adminShopService.unsuspendShop(id).match(
      () => ({ success: true, message: 'Cửa hàng đã được gỡ đình chỉ.' }),
      (error) => {
        throw ShopErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Post(':id/ban')
  @Permissions('shop:manage')
  @ApiOperation({ summary: 'Ban a shop permanently (admin action)' })
  @ApiResponse({ status: 200, description: 'Shop banned successfully' })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  @ApiResponse({ status: 409, description: 'Shop already banned' })
  banShop(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: BanShopArgumentDto,
  ): Promise<{ success: boolean; message: string }> {
    return this.adminShopService.banShop(id, dto.reason).match(
      () => ({
        success: true,
        message: 'Cửa hàng đã bị cấm vĩnh viễn.',
      }),
      (error) => {
        throw ShopErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }
}

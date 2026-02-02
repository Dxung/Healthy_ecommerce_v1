import {
  Controller,
  Inject,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { IOrderService } from './order.service.interface';
import { ORDER_SERVICE } from './tokens/order.token';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../authorization/guards/permissions.guard';
import { Permissions } from '../authorization/decorators/permissions.decorator';
import { ExceptionSource } from 'src/common/exception filters/exception-source';
import { OrderErrorHttpMapper } from './errors/order-errors-http.mapper';
import {
  CancelOrderArgumentDto,
  UpdateShopNoteArgumentDto,
  OrderListQueryDto,
  ShopOrderResponseDto,
  ShopOrderListResponseDto,
} from './dto';

@ApiTags('Shop Orders')
@Controller('shop/orders')
@UseGuards(AuthGuard, PermissionsGuard)
export class ShopOrderController {
  constructor(
    @Inject(ORDER_SERVICE)
    private readonly orderService: IOrderService,
  ) {}

  @Get()
  @Permissions('shop-order:read')
  @ApiOperation({ summary: 'Get shop orders with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  getShopOrders(
    @Query() query: OrderListQueryDto,
  ): Promise<ShopOrderListResponseDto> {
    const filters = {
      status: query.status,
      fromDate: query.fromDate ? new Date(query.fromDate) : undefined,
      toDate: query.toDate ? new Date(query.toDate) : undefined,
    };
    const pagination = {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
    };

    return this.orderService.getShopOrders(filters, pagination).match(
      (result) => new ShopOrderListResponseDto(result),
      (error) => {
        throw OrderErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Get(':id')
  @Permissions('shop-order:read')
  @ApiOperation({ summary: 'Get shop order by ID' })
  @ApiResponse({ status: 200, description: 'Order retrieved successfully' })
  getShopOrderById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ShopOrderResponseDto> {
    return this.orderService.getShopOrderById(id).match(
      (result) => new ShopOrderResponseDto(result),
      (error) => {
        throw OrderErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Post(':id/confirm')
  @Permissions('shop-order:manage')
  @ApiOperation({ summary: 'Confirm order' })
  @ApiResponse({ status: 200, description: 'Order confirmed successfully' })
  confirmOrder(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.orderService.confirmOrder(id).match(
      () => ({ success: true, message: 'Đơn hàng đã được xác nhận.' }),
      (error) => {
        throw OrderErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Post(':id/ship')
  @Permissions('shop-order:manage')
  @ApiOperation({ summary: 'Mark order as shipped (đang giao hàng)' })
  @ApiResponse({ status: 200, description: 'Order marked as shipped' })
  shipOrder(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.orderService.shipOrder(id).match(
      () => ({
        success: true,
        message: 'Đơn hàng đã được giao cho đơn vị vận chuyển.',
      }),
      (error) => {
        throw OrderErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Post(':id/cancel')
  @Permissions('shop-order:manage')
  @ApiOperation({ summary: 'Cancel order' })
  @ApiResponse({ status: 200, description: 'Order cancelled successfully' })
  cancelShopOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CancelOrderArgumentDto,
  ): Promise<{ success: boolean; message: string }> {
    return this.orderService.cancelShopOrder(id, dto.reason).match(
      () => ({ success: true, message: 'Đơn hàng đã được hủy.' }),
      (error) => {
        throw OrderErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Patch(':id/note')
  @Permissions('shop-order:manage')
  @ApiOperation({ summary: 'Update shop note on order' })
  @ApiResponse({ status: 200, description: 'Note updated successfully' })
  updateShopNote(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateShopNoteArgumentDto,
  ): Promise<{ success: boolean; message: string }> {
    return this.orderService.updateShopNote(id, dto.note ?? null).match(
      () => ({ success: true, message: 'Ghi chú đã được cập nhật.' }),
      (error) => {
        throw OrderErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }
}

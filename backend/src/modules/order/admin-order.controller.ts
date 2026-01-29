import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  Inject,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import type { IAdminOrderService } from './admin-order.service.interface';
import { ADMIN_ORDER_SERVICE } from './tokens/order.token';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../authorization/guards/permissions.guard';
import { Permissions } from '../authorization/decorators/permissions.decorator';
import { OrderErrorHttpMapper } from './errors/order-errors-http.mapper';
import { ExceptionSource } from 'src/common/exception filters/exception-source';
import { AdminOrderListQueryDto } from './dto/admin-order-list-query.dto';
import {
  AdminOrderResponseDto,
  AdminOrderListResponseDto,
} from './dto/admin-order-response.dto';
import { AdminUpdateOrderStatusArgumentDto } from './dto/admin-update-status-argument.dto';
import { RefundOrderItemArgumentDto } from './dto/refund-order-item-argument.dto';

@ApiTags('Admin - Order Management')
@ApiBearerAuth()
@Controller('admin/orders')
@UseGuards(AuthGuard, PermissionsGuard)
export class AdminOrderController {
  constructor(
    @Inject(ADMIN_ORDER_SERVICE)
    private readonly adminOrderService: IAdminOrderService,
  ) {}

  @Get()
  @Permissions('order:read')
  @ApiOperation({
    summary: 'Get all orders with pagination and filters (admin)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of orders',
    type: AdminOrderListResponseDto,
  })
  getAllOrders(
    @Query() query: AdminOrderListQueryDto,
  ): Promise<AdminOrderListResponseDto> {
    const filters = {
      status: query.status,
      search: query.search,
      shopId: query.shopId,
      buyerId: query.buyerId,
      fromDate: query.fromDate ? new Date(query.fromDate) : undefined,
      toDate: query.toDate ? new Date(query.toDate) : undefined,
    };
    const pagination = {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
    };

    return this.adminOrderService.getAllOrders(filters, pagination).match(
      (result) => new AdminOrderListResponseDto(result),
      (error) => {
        throw OrderErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Get(':id')
  @Permissions('order:read')
  @ApiOperation({ summary: 'Get order by ID (admin)' })
  @ApiResponse({
    status: 200,
    description: 'Order details',
    type: AdminOrderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  getOrderById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AdminOrderResponseDto> {
    return this.adminOrderService.getOrderById(id).match(
      (order) => new AdminOrderResponseDto(order),
      (error) => {
        throw OrderErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Patch(':id/status')
  @Permissions('order:manage')
  @ApiOperation({ summary: 'Update order status (admin)' })
  @ApiResponse({
    status: 200,
    description: 'Order status updated',
    type: AdminOrderResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  updateOrderStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdminUpdateOrderStatusArgumentDto,
  ): Promise<AdminOrderResponseDto> {
    return this.adminOrderService
      .updateOrderStatus(id, dto.status, dto.note)
      .match(
        (order) => new AdminOrderResponseDto(order),
        (error) => {
          throw OrderErrorHttpMapper.toHttpException(
            error,
            ExceptionSource.CONTROLLER,
          );
        },
      );
  }

  @Post('items/:orderItemId/refund')
  @Permissions('order:manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Refund a specific order item (admin)',
    description:
      'Marks the order item as refunded and hides any associated review. This also recalculates product and shop ratings.',
  })
  @ApiResponse({ status: 204, description: 'Order item refunded successfully' })
  @ApiResponse({ status: 404, description: 'Order item not found' })
  @ApiResponse({ status: 400, description: 'Item already refunded' })
  refundOrderItem(
    @Param('orderItemId', ParseUUIDPipe) orderItemId: string,
    @Body() dto: RefundOrderItemArgumentDto,
  ): Promise<void> {
    return this.adminOrderService.refundOrderItem(orderItemId, dto.reason).match(
      () => undefined,
      (error) => {
        throw OrderErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }
}

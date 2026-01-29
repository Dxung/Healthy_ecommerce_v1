import {
  Controller,
  Inject,
  Get,
  Post,
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
import { ExceptionSource } from 'src/common/exception filters/exception-source';
import { OrderErrorHttpMapper } from './errors/order-errors-http.mapper';
import {
  CreateOrderArgumentDto,
  CreateOrderResponseDto,
  CancelOrderArgumentDto,
  OrderListQueryDto,
  OrderResponseDto,
  OrderListResponseDto,
} from './dto';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(AuthGuard)
export class OrderController {
  constructor(
    @Inject(ORDER_SERVICE)
    private readonly orderService: IOrderService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create orders from selected cart items' })
  @ApiResponse({ status: 201, description: 'Orders created successfully' })
  createOrder(
    @Body() dto: CreateOrderArgumentDto,
  ): Promise<CreateOrderResponseDto> {
    return this.orderService.createOrder(dto).match(
      (result) => new CreateOrderResponseDto(result),
      (error) => {
        throw OrderErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my orders with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  getMyOrders(
    @Query() query: OrderListQueryDto,
  ): Promise<OrderListResponseDto> {
    const filters = {
      status: query.status,
      fromDate: query.fromDate ? new Date(query.fromDate) : undefined,
      toDate: query.toDate ? new Date(query.toDate) : undefined,
    };
    const pagination = {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
    };

    return this.orderService.getMyOrders(filters, pagination).match(
      (result) => new OrderListResponseDto(result),
      (error) => {
        throw OrderErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Get('my/:id')
  @ApiOperation({ summary: 'Get my order by ID' })
  @ApiResponse({ status: 200, description: 'Order retrieved successfully' })
  getMyOrderById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<OrderResponseDto> {
    return this.orderService.getMyOrderById(id).match(
      (result) => new OrderResponseDto(result),
      (error) => {
        throw OrderErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Post('my/:id/cancel')
  @ApiOperation({ summary: 'Cancel my order' })
  @ApiResponse({ status: 200, description: 'Order cancelled successfully' })
  cancelMyOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CancelOrderArgumentDto,
  ): Promise<{ success: boolean; message: string }> {
    return this.orderService.cancelMyOrder(id, dto.reason).match(
      () => ({ success: true, message: 'Đơn hàng đã được hủy thành công.' }),
      (error) => {
        throw OrderErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Post('my/:id/confirm-delivery')
  @ApiOperation({ summary: 'Confirm delivery and complete order' })
  @ApiResponse({ status: 200, description: 'Delivery confirmed successfully' })
  confirmDelivery(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ success: boolean; message: string; coinEarned: number }> {
    return this.orderService.confirmDelivery(id).match(
      (order) => ({
        success: true,
        message: 'Xác nhận nhận hàng thành công.',
        coinEarned: order.coinEarned,
      }),
      (error) => {
        throw OrderErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }
}

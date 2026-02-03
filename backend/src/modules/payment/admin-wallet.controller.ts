import {
  Controller,
  Get,
  Query,
  Inject,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { IAdminWalletService } from './services/admin-wallet.service.interface';
import { ADMIN_WALLET_SERVICE } from './tokens/payment.token';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../authorization/guards/permissions.guard';
import { Permissions } from '../authorization/decorators/permissions.decorator';
import { PaymentErrorHttpMapper } from './errors/payment-errors-http.mapper';
import { ExceptionSource } from 'src/common/exception filters/exception-source';
import {
  PlatformWalletResponseDto,
  PlatformTransactionsListResponseDto,
} from './dto/admin-wallet-response.dto';
import {
  AdminEscrowResponseDto,
  AdminEscrowListResponseDto,
} from './dto/admin-escrow-response.dto';
import { AdminEscrowListQueryDto } from './dto/admin-escrow-list-query.dto';

@ApiTags('Admin - Platform Wallet')
@ApiBearerAuth()
@Controller('admin/wallet')
@UseGuards(AuthGuard, PermissionsGuard)
export class AdminWalletController {
  constructor(
    @Inject(ADMIN_WALLET_SERVICE)
    private readonly adminWalletService: IAdminWalletService,
  ) {}

  @Get()
  @Permissions('order:read')
  @ApiOperation({ summary: 'Get platform wallet balance' })
  @ApiResponse({
    status: 200,
    description: 'Platform wallet balance',
    type: PlatformWalletResponseDto,
  })
  getPlatformWallet(): Promise<PlatformWalletResponseDto> {
    return this.adminWalletService.getPlatformWallet().match(
      (wallet) => new PlatformWalletResponseDto(wallet),
      (error) => {
        throw PaymentErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Get('transactions')
  @Permissions('order:read')
  @ApiOperation({ summary: 'Get platform wallet transactions' })
  @ApiResponse({
    status: 200,
    description: 'Platform wallet transactions with pagination',
    type: PlatformTransactionsListResponseDto,
  })
  getPlatformTransactions(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ): Promise<PlatformTransactionsListResponseDto> {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

    return this.adminWalletService
      .getPlatformTransactions(pageNum, limitNum)
      .match(
        (result) =>
          new PlatformTransactionsListResponseDto(
            result.items,
            result.total,
            result.page,
            result.limit,
          ),
        (error) => {
          throw PaymentErrorHttpMapper.toHttpException(
            error,
            ExceptionSource.CONTROLLER,
          );
        },
      );
  }

  @Get('escrows')
  @Permissions('order:read')
  @ApiOperation({ summary: 'Get escrow holds list' })
  @ApiResponse({
    status: 200,
    description: 'Escrow holds with pagination and filtering',
    type: AdminEscrowListResponseDto,
  })
  getEscrowHolds(
    @Query() query: AdminEscrowListQueryDto,
  ): Promise<AdminEscrowListResponseDto> {
    const filters = {
      status: query.status,
      fromDate: query.fromDate,
      toDate: query.toDate,
    };
    const page = query.page || 1;
    const limit = query.limit || 20;

    return this.adminWalletService.getEscrowHolds(filters, page, limit).match(
      (result) => {
        const items = result.items.map(
          (item) =>
            new AdminEscrowResponseDto(
              {
                id: item.id,
                orderId: item.orderId,
                shopId: item.shopId,
                amount: item.amount,
                orderSubtotal: item.orderSubtotal,
                shippingFee: item.shippingFee,
                coinUsed: item.coinUsed,
                platformFeePercent: item.platformFeePercent,
                platformShipDiscount: item.platformShipDiscount,
                status: item.status,
                createdAt: item.createdAt,
                releasedAt: item.releasedAt,
              },
              item.orderCode,
              item.shopName,
            ),
        );
        return new AdminEscrowListResponseDto(
          items,
          result.total,
          result.page,
          result.limit,
        );
      },
      (error) => {
        throw PaymentErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }
}

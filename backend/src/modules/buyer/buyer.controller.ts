import { Controller, Get, Inject, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import type { IBuyerService } from './buyer.service.interface';
import { BUYER_SERVICE } from './tokens/buyer.token';
import { AuthGuard } from '../auth/guards/auth.guard';
import { BuyerErrorHttpMapper } from './errors/buyer-error-http.mapper';
import { ExceptionSource } from 'src/common/exception filters/exception-source';

@ApiTags('Buyers')
@Controller('buyers')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class BuyerController {
  constructor(
    @Inject(BUYER_SERVICE)
    private readonly buyerService: IBuyerService,
  ) {}

  @Get('coin-wallet')
  @ApiOperation({ summary: 'Get current buyer coin wallet' })
  getMyCoinWallet() {
    return this.buyerService.getMyCoinWallet().match(
      (wallet) => ({
        id: wallet.id,
        balance: wallet.balance,
        updatedAt: wallet.updatedAt,
      }),
      (error) => {
        throw BuyerErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Get('coin-transactions')
  @ApiOperation({ summary: 'Get current buyer coin transaction history' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getMyCoinTransactions(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '20', 10);

    return this.buyerService
      .getMyCoinTransactions({ page: pageNum, limit: limitNum })
      .match(
        (result) => ({
          items: result.items.map((tx) => ({
            id: tx.id,
            type: tx.type,
            amount: tx.amount,
            balanceBefore: tx.balanceBefore,
            balanceAfter: tx.balanceAfter,
            referenceType: tx.referenceType,
            referenceId: tx.referenceId,
            description: tx.description,
            createdAt: tx.createdAt,
          })),
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        }),
        (error) => {
          throw BuyerErrorHttpMapper.toHttpException(
            error,
            ExceptionSource.CONTROLLER,
          );
        },
      );
  }
}

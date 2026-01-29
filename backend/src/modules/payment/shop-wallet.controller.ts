import { Controller, Get, Query, Inject, UseGuards } from '@nestjs/common';
import { IWalletService } from './services/wallet.service.interface';
import { WALLET_SERVICE } from './tokens/payment.token';
import { AuthGuard } from '../auth/guards/auth.guard';
import { WalletBalanceResponseDto, WalletTransactionResponseDto } from './dto';
import { PaymentErrorHttpMapper } from './errors/payment-errors-http.mapper';
import { ExceptionSource } from 'src/common/exception filters/exception-source';

@Controller('shop/wallet')
@UseGuards(AuthGuard)
export class ShopWalletController {
  constructor(
    @Inject(WALLET_SERVICE)
    private readonly walletService: IWalletService,
  ) {}

  @Get('balance')
  getBalance(): Promise<WalletBalanceResponseDto> {
    return this.walletService.getMyShopWalletBalance().match(
      (balance) => new WalletBalanceResponseDto(balance),
      (error) => {
        throw PaymentErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Get('transactions')
  getTransactions(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ): Promise<{
    items: WalletTransactionResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));

    return this.walletService
      .getMyShopTransactionHistory(pageNum, limitNum)
      .match(
        (result) => ({
          items: WalletTransactionResponseDto.fromList(result.items),
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        }),
        (error) => {
          throw PaymentErrorHttpMapper.toHttpException(
            error,
            ExceptionSource.CONTROLLER,
          );
        },
      );
  }
}

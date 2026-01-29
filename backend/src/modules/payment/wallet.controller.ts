import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Inject,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { IWalletService } from './services/wallet.service.interface';
import { WALLET_SERVICE } from './tokens/payment.token';
import { AuthGuard } from '../auth/guards/auth.guard';
import {
  WalletBalanceResponseDto,
  WalletTransactionResponseDto,
  TopupRequestDto,
  TopupResponseDto,
} from './dto';
import { PaymentErrorHttpMapper } from './errors/payment-errors-http.mapper';
import { ExceptionSource } from 'src/common/exception filters/exception-source';

@Controller('wallet')
@UseGuards(AuthGuard)
export class WalletController {
  constructor(
    @Inject(WALLET_SERVICE)
    private readonly walletService: IWalletService,
  ) {}

  @Get('balance')
  getBalance(): Promise<WalletBalanceResponseDto> {
    return this.walletService.getWalletBalance().match(
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

    return this.walletService.getTransactionHistory(pageNum, limitNum).match(
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

  @Post('topup')
  initiateTopup(
    @Body() dto: TopupRequestDto,
    @Req() req: Request,
  ): Promise<TopupResponseDto> {
    const ipAddress =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      '127.0.0.1';

    return this.walletService.initiateTopup(dto.amount, ipAddress).match(
      (result) => new TopupResponseDto(result),
      (error) => {
        throw PaymentErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }
}

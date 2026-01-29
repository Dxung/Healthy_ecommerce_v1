import { Controller, Get, Post, Query, Res, Inject } from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { IPaymentService } from './payment.service.interface';
import { VnpayReturnQuery } from './services/vnpay.service.interface';
import { PAYMENT_SERVICE } from './tokens/payment.token';
import { VnpayReturnQueryDto } from './dto/vnpay-return-query.dto';

@Controller('payments')
export class PaymentController {
  constructor(
    @Inject(PAYMENT_SERVICE)
    private readonly paymentService: IPaymentService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * VNPay Return URL - Handle redirect from VNPay after payment
   * This endpoint is public (no auth) as VNPay redirects the user here
   */
  @Get('vnpay/return')
  handleVnpayReturn(
    @Query() query: VnpayReturnQueryDto,
    @Res() res: Response,
  ): void {
    const frontendUrl =
      this.configService.get<string>('CORS_ORIGIN') || 'http://localhost:3000';

    void this.paymentService.handleVnpayReturn(query as VnpayReturnQuery).match(
      (result) => {
        const params = new URLSearchParams(result.redirectParams);
        res.redirect(
          `${frontendUrl}${result.redirectPath}?${params.toString()}`,
        );
      },
      () => {
        res.redirect(`${frontendUrl}/user/wallet?status=error`);
      },
    );
  }

  /**
   * VNPay IPN URL - Handle Instant Payment Notification from VNPay
   * This is a server-to-server callback, must return specific response format
   */
  @Post('vnpay/ipn')
  handleVnpayIpn(@Query() query: VnpayReturnQueryDto): Promise<{
    RspCode: string;
    Message: string;
  }> {
    return this.paymentService.handleVnpayIpn(query as VnpayReturnQuery).match(
      (result) => result,
      () => ({ RspCode: '97', Message: 'Invalid signature' }),
    );
  }
}

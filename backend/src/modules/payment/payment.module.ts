import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PaymentController } from './payment.controller';
import { WalletController } from './wallet.controller';
import { ShopWalletController } from './shop-wallet.controller';
import { PaymentService } from './payment.service';
import { VnpayService } from './services/vnpay.service';
import { WalletService } from './services/wallet.service';
import { EscrowService } from './services/escrow.service';
import {
  PAYMENT_SERVICE,
  VNPAY_SERVICE,
  WALLET_SERVICE,
  ESCROW_SERVICE,
} from './tokens/payment.token';
import { vnpayConfig } from './configs/vnpay.config';
import { PaymentTimeoutCronjob } from './cronjobs/payment-timeout.cronjob';
import { EscrowReleaseCronjob } from './cronjobs/escrow-release.cronjob';
import { RefundProcessorCronjob } from './cronjobs/refund-processor.cronjob';
import { DatabaseModule } from 'src/database/database.module';
import { AlsModule } from 'src/shared/als/als.module';
import { AuthModule } from '../auth/auth.module';
import { SessionModule } from '../session/session.module';
import { ShopModule } from '../shop/shop.module';
import { OrderModule } from '../order/order.module';

/**
 * PaymentModule handles wallet management, VNPay integration, and escrow.
 *
 * Circular dependencies (resolved via forwardRef):
 * - ShopModule: WalletService calls ShopService.getMyShop() for shop wallet operations
 * - OrderModule: PaymentService calls OrderService.processVnpayPaymentSuccess() for VNPay callbacks
 *
 * These circular dependencies are architectural necessities:
 * - OrderModule needs PaymentModule to create payments and process wallet/escrow operations
 * - PaymentModule needs OrderModule to notify order service when VNPay payment completes
 */
@Module({
  imports: [
    DatabaseModule,
    AlsModule,
    AuthModule,
    SessionModule,
    // forwardRef required: ShopModule doesn't import PaymentModule, but WalletService
    // needs ShopService to resolve current user's shop for shop wallet operations
    forwardRef(() => ShopModule),
    // forwardRef required: OrderModule imports PaymentModule for payment services,
    // and PaymentModule needs OrderModule for PaymentService to call OrderService
    // when VNPay payment callbacks are received
    forwardRef(() => OrderModule),
    ConfigModule.forFeature(vnpayConfig),
    ScheduleModule.forRoot(),
  ],
  providers: [
    {
      provide: PAYMENT_SERVICE,
      useClass: PaymentService,
    },
    {
      provide: VNPAY_SERVICE,
      useClass: VnpayService,
    },
    {
      provide: WALLET_SERVICE,
      useClass: WalletService,
    },
    {
      provide: ESCROW_SERVICE,
      useClass: EscrowService,
    },
    // Cronjobs
    PaymentTimeoutCronjob,
    EscrowReleaseCronjob,
    RefundProcessorCronjob,
  ],
  controllers: [PaymentController, WalletController, ShopWalletController],
  exports: [PAYMENT_SERVICE, WALLET_SERVICE, ESCROW_SERVICE, VNPAY_SERVICE],
})
export class PaymentModule {}

import { Module, forwardRef } from '@nestjs/common';
import { OrderController } from './order.controller';
import { ShopOrderController } from './shop-order.controller';
import { AdminOrderController } from './admin-order.controller';
import { OrderService } from './order.service';
import { AdminOrderService } from './admin-order.service';
import { OrderPaymentTimeoutCronjob } from './cronjobs/order-payment-timeout.cronjob';
import { OrderAutoCompleteCronjob } from './cronjobs/order-auto-complete.cronjob';
import { ORDER_SERVICE, ADMIN_ORDER_SERVICE } from './tokens/order.token';
import { DatabaseModule } from 'src/database/database.module';
import { AlsModule } from 'src/shared/als/als.module';
import { UoWModule } from 'src/shared/unitOfWork/uow.module';
import { CustomLoggerModule } from 'src/shared/custom-loggers/custom-logger.module';
import { CartModule } from '../cart/cart.module';
import { UserModule } from '../user/user.module';
import { ShopModule } from '../shop/shop.module';
import { SessionModule } from '../session/session.module';
import { AuthorizationModule } from '../authorization/authorization.module';
import { PaymentModule } from '../payment/payment.module';
import { ReviewModule } from '../review/review.module';
import { BuyerModule } from '../buyer/buyer.module';
import { ProductModule } from '../product/product.module';
import { SystemConfigModule } from '../system-config/system-config.module';

@Module({
  imports: [
    DatabaseModule,
    AlsModule,
    UoWModule,
    CustomLoggerModule,
    CartModule,
    UserModule,
    ShopModule,
    SessionModule,
    AuthorizationModule,
    forwardRef(() => PaymentModule),
    forwardRef(() => ReviewModule),
    BuyerModule,
    ProductModule,
    SystemConfigModule,
  ],
  providers: [
    {
      provide: ORDER_SERVICE,
      useClass: OrderService,
    },
    {
      provide: ADMIN_ORDER_SERVICE,
      useClass: AdminOrderService,
    },
    OrderPaymentTimeoutCronjob,
    OrderAutoCompleteCronjob,
  ],
  controllers: [OrderController, ShopOrderController, AdminOrderController],
  exports: [ORDER_SERVICE, ADMIN_ORDER_SERVICE],
})
export class OrderModule {}

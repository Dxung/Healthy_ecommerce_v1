import { Module, forwardRef } from '@nestjs/common';
import { OrderController } from './order.controller';
import { ShopOrderController } from './shop-order.controller';
import { AdminOrderController } from './admin-order.controller';
import { OrderService } from './order.service';
import { AdminOrderService } from './admin-order.service';
import { ORDER_SERVICE, ADMIN_ORDER_SERVICE } from './tokens/order.token';
import { DatabaseModule } from 'src/database/database.module';
import { AlsModule } from 'src/shared/als/als.module';
import { CartModule } from '../cart/cart.module';
import { UserModule } from '../user/user.module';
import { ShopModule } from '../shop/shop.module';
import { SessionModule } from '../session/session.module';
import { AuthorizationModule } from '../authorization/authorization.module';
import { PaymentModule } from '../payment/payment.module';
import { ReviewModule } from '../review/review.module';
import { BuyerModule } from '../buyer/buyer.module';

@Module({
  imports: [
    DatabaseModule,
    AlsModule,
    CartModule,
    UserModule,
    ShopModule,
    SessionModule,
    AuthorizationModule,
    forwardRef(() => PaymentModule),
    forwardRef(() => ReviewModule),
    BuyerModule,
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
  ],
  controllers: [OrderController, ShopOrderController, AdminOrderController],
  exports: [ORDER_SERVICE, ADMIN_ORDER_SERVICE],
})
export class OrderModule {}

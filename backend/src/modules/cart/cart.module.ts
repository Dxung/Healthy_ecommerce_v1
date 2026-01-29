import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CART_SERVICE } from './tokens/cart.token';
import { DatabaseModule } from 'src/database/database.module';
import { AlsModule } from 'src/shared/als/als.module';
import { AuthModule } from '../auth/auth.module';
import { ProductModule } from '../product/product.module';
import { SessionModule } from '../session/session.module';

@Module({
  imports: [
    DatabaseModule,
    AlsModule,
    AuthModule,
    ProductModule,
    SessionModule,
  ],
  providers: [
    {
      provide: CART_SERVICE,
      useClass: CartService,
    },
  ],
  controllers: [CartController],
  exports: [CART_SERVICE],
})
export class CartModule {}

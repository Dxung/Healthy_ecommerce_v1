import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { SessionModule } from './modules/session/session.module';
import { CacheModule } from '@nestjs/cache-manager';
import { CustomLoggerModule } from './shared/custom-loggers/custom-logger.module';
import { GlobalAllExceptionFilter } from './common/exception filters/global-all-exception.filter';
import { ShopModule } from './modules/shop/shop.module';
import { ProductModule } from './modules/product/product.module';
import { OrderModule } from './modules/order/order.module';
import { SystemConfigModule } from './modules/system-config/system-config.module';
import { MealPlanModule } from './modules/meal-plan/meal-plan.module';

/**
 * The root module of the application.
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    CacheModule.register({ isGlobal: true }),
    CustomLoggerModule,
    DatabaseModule,
    AuthModule,
    UserModule,
    SessionModule,
    ShopModule,
    ProductModule,
    OrderModule,
    SystemConfigModule,
    MealPlanModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: GlobalAllExceptionFilter,
    },
  ],
})
export class AppModule {}

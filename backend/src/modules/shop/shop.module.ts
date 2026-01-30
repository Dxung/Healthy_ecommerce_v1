import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ShopController } from './shop.controller';
import { AdminShopRegistrationController } from './admin-shop-registration.controller';
import { AdminShopController } from './admin-shop.controller';
import {
  AdminBadgeController,
  AdminDocumentTypeController,
} from './admin-badge.controller';
import { ShopService } from './shop.service';
import { AdminBadgeService } from './admin-badge.service';
import { AdminShopService } from './admin-shop.service';
import { ShopBadgeBenefitsService } from './shop-badge-benefits.service';
import { BadgeEligibilityCronjob } from './cronjobs/badge-eligibility.cronjob';
import {
  SHOP_SERVICE,
  ADMIN_BADGE_SERVICE,
  ADMIN_SHOP_SERVICE,
  SHOP_BADGE_BENEFITS_SERVICE,
} from './tokens/shop.token';
import { DatabaseModule } from 'src/database/database.module';
import { AlsModule } from 'src/shared/als/als.module';
import { LocationModule } from '../location/location.module';
import { AuthorizationModule } from '../authorization/authorization.module';
import { SessionModule } from '../session/session.module';
import { VerificationModule } from '../verification/verification.module';
import { UoWModule } from 'src/shared/unitOfWork/uow.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    DatabaseModule,
    AlsModule,
    LocationModule,
    AuthorizationModule,
    SessionModule,
    VerificationModule,
    UoWModule,
    UserModule,
    ScheduleModule.forRoot(),
  ],
  providers: [
    {
      provide: SHOP_SERVICE,
      useClass: ShopService,
    },
    {
      provide: ADMIN_BADGE_SERVICE,
      useClass: AdminBadgeService,
    },
    {
      provide: ADMIN_SHOP_SERVICE,
      useClass: AdminShopService,
    },
    {
      provide: SHOP_BADGE_BENEFITS_SERVICE,
      useClass: ShopBadgeBenefitsService,
    },
    // Cronjobs
    BadgeEligibilityCronjob,
  ],
  controllers: [
    ShopController,
    AdminShopRegistrationController,
    AdminShopController,
    AdminBadgeController,
    AdminDocumentTypeController,
  ],
  exports: [SHOP_SERVICE, ADMIN_BADGE_SERVICE, ADMIN_SHOP_SERVICE, SHOP_BADGE_BENEFITS_SERVICE],
})
export class ShopModule {}

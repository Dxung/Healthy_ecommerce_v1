import { Module } from '@nestjs/common';
import { BuyerController } from './buyer.controller';
import { BuyerService } from './buyer.service';
import { BUYER_SERVICE } from './tokens/buyer.token';
import { DatabaseModule } from 'src/database/database.module';
import { AlsModule } from 'src/shared/als/als.module';
import { SessionModule } from '../session/session.module';

@Module({
  imports: [DatabaseModule, AlsModule, SessionModule],
  providers: [
    {
      provide: BUYER_SERVICE,
      useClass: BuyerService,
    },
  ],
  controllers: [BuyerController],
  exports: [BUYER_SERVICE],
})
export class BuyerModule {}

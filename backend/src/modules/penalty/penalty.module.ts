import { Module } from '@nestjs/common';
import { PenaltyController } from './penalty.controller';
import { PenaltyService } from './penalty.service';
import { PENALTY_SERVICE } from './tokens/penalty.token';
import { DatabaseModule } from 'src/database/database.module';
import { AlsModule } from 'src/shared/als/als.module';

@Module({
  imports: [DatabaseModule, AlsModule],
  providers: [
    {
      provide: PENALTY_SERVICE,
      useClass: PenaltyService,
    },
  ],
  controllers: [PenaltyController],
  exports: [PENALTY_SERVICE],
})
export class PenaltyModule {}

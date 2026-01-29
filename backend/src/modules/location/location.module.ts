import { Module } from '@nestjs/common';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';
import { LOCATION_SERVICE } from './tokens/location.token';
import { DatabaseModule } from 'src/database/database.module';
import { AlsModule } from 'src/shared/als/als.module';

@Module({
  imports: [DatabaseModule, AlsModule],
  providers: [
    {
      provide: LOCATION_SERVICE,
      useClass: LocationService,
    },
  ],
  controllers: [LocationController],
  exports: [LOCATION_SERVICE],
})
export class LocationModule {}

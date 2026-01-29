import { Global, Module } from '@nestjs/common';
import { CUSTOM_LOG } from './tokens/custom-logger.token';
import { AlsLoggerService } from './als-logger.service';
import { AlsModule } from '../als/als.module';

@Global()
@Module({
  imports: [AlsModule],
  providers: [
    {
      provide: CUSTOM_LOG,
      useClass: AlsLoggerService,
    },
  ],
  exports: [CUSTOM_LOG],
})
export class CustomLoggerModule {}

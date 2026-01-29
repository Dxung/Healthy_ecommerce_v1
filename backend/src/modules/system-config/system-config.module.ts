import { Module, Global } from '@nestjs/common';
import { SystemConfigController } from './system-config.controller';
import { SystemConfigService } from './system-config.service';
import { SYSTEM_CONFIG_SERVICE } from './tokens/system-config.token';
import { DatabaseModule } from 'src/database/database.module';
import { AlsModule } from 'src/shared/als/als.module';
import { SessionModule } from '../session/session.module';
import { AuthorizationModule } from '../authorization/authorization.module';

@Global()
@Module({
  imports: [DatabaseModule, AlsModule, SessionModule, AuthorizationModule],
  providers: [
    {
      provide: SYSTEM_CONFIG_SERVICE,
      useClass: SystemConfigService,
    },
  ],
  controllers: [SystemConfigController],
  exports: [SYSTEM_CONFIG_SERVICE],
})
export class SystemConfigModule {}

import { Module, forwardRef } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SESSION_SERVICE } from './tokens/session.token';
import { SessionService } from './session.service';
import { SessionCleanupService } from './session-cleanup.service';
import { DatabaseModule } from 'src/database/database.module';
import { SessionController } from './session.controller';
import { AlsModule } from 'src/shared/als/als.module';
import { AuthorizationModule } from '../authorization/authorization.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    DatabaseModule,
    AlsModule,
    forwardRef(() => AuthorizationModule),
  ],
  providers: [
    {
      provide: SESSION_SERVICE,
      useClass: SessionService,
    },
    SessionCleanupService,
  ],
  controllers: [SessionController],
  exports: [SESSION_SERVICE],
})
export class SessionModule {}

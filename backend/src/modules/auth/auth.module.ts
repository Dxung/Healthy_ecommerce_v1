import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { DatabaseModule } from 'src/database/database.module';
import { UserModule } from '../user/user.module';
import { AUTH_SERVICE } from './tokens/auth.token';
import { AuthService } from './auth.service';
import { SessionModule } from '../session/session.module';
import { VerificationModule } from '../verification/verification.module';
import { UoWModule } from 'src/shared/unitOfWork/uow.module';
import { AlsModule } from 'src/shared/als/als.module';
import { AuthorizationModule } from '../authorization/authorization.module';

@Module({
  imports: [
    DatabaseModule,
    UserModule,
    SessionModule,
    VerificationModule,
    UoWModule,
    AlsModule,
    AuthorizationModule,
  ],
  providers: [
    {
      provide: AUTH_SERVICE,
      useClass: AuthService,
    },
  ],
  controllers: [AuthController],
  exports: [AUTH_SERVICE],
})
export class AuthModule {}

import { Module } from '@nestjs/common';
import { USER_SERVICE, ADMIN_USER_SERVICE } from './tokens/user.token';
import { UserService } from './user.service';
import { AdminUserService } from './admin-user.service';
import { UserController } from './user.controller';
import { AdminUserController } from './admin-user.controller';
import { DatabaseModule } from 'src/database/database.module';
import { AlsModule } from 'src/shared/als/als.module';
import { SessionModule } from '../session/session.module';
import { VerificationModule } from '../verification/verification.module';
import { LocationModule } from '../location/location.module';
import { UoWModule } from 'src/shared/unitOfWork/uow.module';
import { ImageProcessingModule } from 'src/shared/image-processing/image-processing.module';
import { AuthorizationModule } from '../authorization/authorization.module';

@Module({
  imports: [
    DatabaseModule,
    AlsModule,
    SessionModule,
    VerificationModule,
    LocationModule,
    UoWModule,
    ImageProcessingModule,
    AuthorizationModule,
  ],
  providers: [
    {
      provide: USER_SERVICE,
      useClass: UserService,
    },
    {
      provide: ADMIN_USER_SERVICE,
      useClass: AdminUserService,
    },
  ],
  controllers: [UserController, AdminUserController],
  exports: [USER_SERVICE],
})
export class UserModule {}

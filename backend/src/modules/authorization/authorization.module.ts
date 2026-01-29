import { Module, forwardRef } from '@nestjs/common';
import { AuthorizationService } from './authorization.service';
import { AdminRoleService } from './admin-role.service';
import { AdminPermissionService } from './admin-permission.service';
import { AdminUserRoleService } from './admin-user-role.service';
import {
  AUTHORIZATION_SERVICE,
  ADMIN_ROLE_SERVICE,
  ADMIN_PERMISSION_SERVICE,
  ADMIN_USER_ROLE_SERVICE,
} from './tokens/authorization.token';
import { AdminRoleController } from './admin-role.controller';
import { AdminPermissionController } from './admin-permission.controller';
import { AdminUserRoleController } from './admin-user-role.controller';
import { DatabaseModule } from 'src/database/database.module';
import { AlsModule } from 'src/shared/als/als.module';
import { SessionModule } from '../session/session.module';

@Module({
  imports: [DatabaseModule, AlsModule, forwardRef(() => SessionModule)],
  controllers: [
    AdminRoleController,
    AdminPermissionController,
    AdminUserRoleController,
  ],
  providers: [
    {
      provide: AUTHORIZATION_SERVICE,
      useClass: AuthorizationService,
    },
    {
      provide: ADMIN_ROLE_SERVICE,
      useClass: AdminRoleService,
    },
    {
      provide: ADMIN_PERMISSION_SERVICE,
      useClass: AdminPermissionService,
    },
    {
      provide: ADMIN_USER_ROLE_SERVICE,
      useClass: AdminUserRoleService,
    },
  ],
  exports: [AUTHORIZATION_SERVICE],
})
export class AuthorizationModule {}

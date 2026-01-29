import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Inject,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ADMIN_USER_ROLE_SERVICE } from './tokens/authorization.token';
import { IAdminUserRoleService } from './admin-user-role.service.interface';
import { AssignRoleArgumentDto, UserRolesResponseDto } from './dto';
import { AuthorizationErrorHttpMapper } from './errors/authorization-errors-http.mapper';
import { ExceptionSource } from 'src/common/exception filters/exception-source';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { Permissions } from './decorators/permissions.decorator';

@ApiTags('Admin - User Roles')
@ApiBearerAuth()
@Controller('admin/users')
@UseGuards(AuthGuard, PermissionsGuard)
export class AdminUserRoleController {
  constructor(
    @Inject(ADMIN_USER_ROLE_SERVICE)
    private readonly adminUserRoleService: IAdminUserRoleService,
  ) {}

  @Get(':userId/roles')
  @Permissions('user-role:read')
  @ApiOperation({ summary: 'Get roles assigned to a user' })
  @ApiResponse({
    status: 200,
    description: 'List of roles assigned to the user',
    type: UserRolesResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  getUserRoles(
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<UserRolesResponseDto> {
    return this.adminUserRoleService.getUserRoles(userId).match(
      (roles) => new UserRolesResponseDto(userId, roles),
      (error) => {
        throw AuthorizationErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Post(':userId/roles')
  @Permissions('user-role:assign')
  @ApiOperation({ summary: 'Assign a role to a user' })
  @ApiResponse({ status: 200, description: 'Role assigned to user' })
  @ApiResponse({ status: 404, description: 'User or role not found' })
  @ApiResponse({ status: 409, description: 'User already has this role' })
  assignRoleToUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: AssignRoleArgumentDto,
  ): Promise<{ message: string }> {
    return this.adminUserRoleService.assignRoleToUser(userId, dto).match(
      () => ({ message: 'Role assigned successfully' }),
      (error) => {
        throw AuthorizationErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Delete(':userId/roles/:roleId')
  @Permissions('user-role:remove')
  @ApiOperation({ summary: 'Remove a role from a user' })
  @ApiResponse({ status: 200, description: 'Role removed from user' })
  @ApiResponse({ status: 400, description: 'User does not have this role' })
  @ApiResponse({ status: 404, description: 'User or role not found' })
  removeRoleFromUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('roleId', ParseUUIDPipe) roleId: string,
  ): Promise<{ message: string }> {
    return this.adminUserRoleService.removeRoleFromUser(userId, roleId).match(
      () => ({ message: 'Role removed successfully' }),
      (error) => {
        throw AuthorizationErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }
}

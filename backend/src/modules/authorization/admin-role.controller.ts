import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Inject,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ADMIN_ROLE_SERVICE } from './tokens/authorization.token';
import { IAdminRoleService } from './admin-role.service.interface';
import {
  CreateRoleArgumentDto,
  UpdateRoleArgumentDto,
  AssignPermissionsArgumentDto,
  RoleResponseDto,
  RoleWithPermissionsResponseDto,
} from './dto';
import { AuthorizationErrorHttpMapper } from './errors/authorization-errors-http.mapper';
import { ExceptionSource } from 'src/common/exception filters/exception-source';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { Permissions } from './decorators/permissions.decorator';

@ApiTags('Admin - Roles')
@ApiBearerAuth()
@Controller('admin/roles')
@UseGuards(AuthGuard, PermissionsGuard)
export class AdminRoleController {
  constructor(
    @Inject(ADMIN_ROLE_SERVICE)
    private readonly adminRoleService: IAdminRoleService,
  ) {}

  @Get()
  @Permissions('role:read')
  @ApiOperation({ summary: 'Get all roles' })
  @ApiQuery({
    name: 'activeOnly',
    required: false,
    type: Boolean,
    description: 'Filter by active status',
  })
  @ApiResponse({
    status: 200,
    description: 'List of roles',
    type: [RoleResponseDto],
  })
  getAllRoles(
    @Query('activeOnly') activeOnly?: string,
  ): Promise<RoleResponseDto[]> {
    const isActiveOnly = activeOnly === 'true' ? true : undefined;

    return this.adminRoleService.getAllRoles(isActiveOnly).match(
      (roles) => RoleResponseDto.fromList(roles),
      (error) => {
        throw AuthorizationErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Get(':id')
  @Permissions('role:read')
  @ApiOperation({ summary: 'Get role by ID with permissions' })
  @ApiResponse({
    status: 200,
    description: 'Role details with permissions',
    type: RoleWithPermissionsResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Role not found' })
  getRoleById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<RoleWithPermissionsResponseDto> {
    return this.adminRoleService.getRoleWithPermissions(id).match(
      (role) => new RoleWithPermissionsResponseDto(role),
      (error) => {
        throw AuthorizationErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Post()
  @Permissions('role:create')
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({
    status: 201,
    description: 'Role created',
    type: RoleResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 409, description: 'Role name already exists' })
  createRole(@Body() dto: CreateRoleArgumentDto): Promise<RoleResponseDto> {
    return this.adminRoleService.createRole(dto).match(
      (role) => new RoleResponseDto(role),
      (error) => {
        throw AuthorizationErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Patch(':id')
  @Permissions('role:update')
  @ApiOperation({ summary: 'Update a role' })
  @ApiResponse({
    status: 200,
    description: 'Role updated',
    type: RoleResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Cannot modify system roles' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 409, description: 'Role name already exists' })
  updateRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRoleArgumentDto,
  ): Promise<RoleResponseDto> {
    return this.adminRoleService.updateRole(id, dto).match(
      (role) => new RoleResponseDto(role),
      (error) => {
        throw AuthorizationErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Delete(':id')
  @Permissions('role:delete')
  @ApiOperation({ summary: 'Delete a role' })
  @ApiResponse({ status: 200, description: 'Role deleted' })
  @ApiResponse({
    status: 400,
    description: 'Role has users or is a system role',
  })
  @ApiResponse({ status: 404, description: 'Role not found' })
  deleteRole(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    return this.adminRoleService.deleteRole(id).match(
      () => ({ message: 'Role deleted successfully' }),
      (error) => {
        throw AuthorizationErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Post(':id/permissions')
  @Permissions('role:update')
  @ApiOperation({ summary: 'Assign permissions to a role' })
  @ApiResponse({
    status: 200,
    description: 'Permissions assigned',
    type: RoleWithPermissionsResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Role or permission not found' })
  assignPermissions(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignPermissionsArgumentDto,
  ): Promise<RoleWithPermissionsResponseDto> {
    return this.adminRoleService.assignPermissionsToRole(id, dto).match(
      (role) => new RoleWithPermissionsResponseDto(role),
      (error) => {
        throw AuthorizationErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Delete(':roleId/permissions/:permissionId')
  @Permissions('role:update')
  @ApiOperation({ summary: 'Remove a permission from a role' })
  @ApiResponse({ status: 200, description: 'Permission removed' })
  @ApiResponse({
    status: 400,
    description: 'Role does not have this permission',
  })
  @ApiResponse({ status: 404, description: 'Role not found' })
  removePermission(
    @Param('roleId', ParseUUIDPipe) roleId: string,
    @Param('permissionId', ParseUUIDPipe) permissionId: string,
  ): Promise<{ message: string }> {
    return this.adminRoleService
      .removePermissionFromRole(roleId, permissionId)
      .match(
        () => ({ message: 'Permission removed successfully' }),
        (error) => {
          throw AuthorizationErrorHttpMapper.toHttpException(
            error,
            ExceptionSource.CONTROLLER,
          );
        },
      );
  }

  @Post(':id/invalidate-cache')
  @Permissions('role:update')
  @ApiOperation({
    summary: 'Invalidate permission cache for all users with this role',
    description:
      'Use this after making direct SQL changes to role permissions. ' +
      'This clears the cached permissions for all users who have this role.',
  })
  @ApiResponse({
    status: 200,
    description: 'Cache invalidated',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        usersAffected: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Role not found' })
  invalidateRoleCache(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string; usersAffected: number }> {
    return this.adminRoleService.invalidateRoleCache(id).match(
      (count) => ({
        message: `Cache invalidated for ${count} users`,
        usersAffected: count,
      }),
      (error) => {
        throw AuthorizationErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }
}

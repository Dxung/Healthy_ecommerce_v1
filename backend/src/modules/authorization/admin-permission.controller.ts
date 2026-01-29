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
import { ADMIN_PERMISSION_SERVICE } from './tokens/authorization.token';
import { IAdminPermissionService } from './admin-permission.service.interface';
import {
  CreatePermissionArgumentDto,
  UpdatePermissionArgumentDto,
  PermissionResponseDto,
  PermissionsGroupedResponseDto,
} from './dto';
import { AuthorizationErrorHttpMapper } from './errors/authorization-errors-http.mapper';
import { ExceptionSource } from 'src/common/exception filters/exception-source';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { Permissions } from './decorators/permissions.decorator';

@ApiTags('Admin - Permissions')
@ApiBearerAuth()
@Controller('admin/permissions')
@UseGuards(AuthGuard, PermissionsGuard)
export class AdminPermissionController {
  constructor(
    @Inject(ADMIN_PERMISSION_SERVICE)
    private readonly adminPermissionService: IAdminPermissionService,
  ) {}

  @Get()
  @Permissions('permission:read')
  @ApiOperation({ summary: 'Get all permissions' })
  @ApiQuery({
    name: 'grouped',
    required: false,
    type: Boolean,
    description: 'Group permissions by resource',
  })
  @ApiResponse({
    status: 200,
    description: 'List of permissions',
    type: [PermissionResponseDto],
  })
  getAllPermissions(
    @Query('grouped') grouped?: string,
  ): Promise<PermissionResponseDto[] | PermissionsGroupedResponseDto[]> {
    if (grouped === 'true') {
      return this.adminPermissionService
        .getPermissionsGroupedByResource()
        .match(
          (groupedMap) =>
            PermissionsGroupedResponseDto.fromGroupedMap(groupedMap),
          (error) => {
            throw AuthorizationErrorHttpMapper.toHttpException(
              error,
              ExceptionSource.CONTROLLER,
            );
          },
        );
    }

    return this.adminPermissionService.getAllPermissions().match(
      (permissions) => PermissionResponseDto.fromList(permissions),
      (error) => {
        throw AuthorizationErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Get(':id')
  @Permissions('permission:read')
  @ApiOperation({ summary: 'Get permission by ID' })
  @ApiResponse({
    status: 200,
    description: 'Permission details',
    type: PermissionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  getPermissionById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PermissionResponseDto> {
    return this.adminPermissionService.getPermissionById(id).match(
      (permission) => new PermissionResponseDto(permission),
      (error) => {
        throw AuthorizationErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Post()
  @Permissions('permission:create')
  @ApiOperation({ summary: 'Create a new permission' })
  @ApiResponse({
    status: 201,
    description: 'Permission created',
    type: PermissionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 409, description: 'Permission already exists' })
  createPermission(
    @Body() dto: CreatePermissionArgumentDto,
  ): Promise<PermissionResponseDto> {
    return this.adminPermissionService.createPermission(dto).match(
      (permission) => new PermissionResponseDto(permission),
      (error) => {
        throw AuthorizationErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Patch(':id')
  @Permissions('permission:update')
  @ApiOperation({ summary: 'Update a permission' })
  @ApiResponse({
    status: 200,
    description: 'Permission updated',
    type: PermissionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  updatePermission(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePermissionArgumentDto,
  ): Promise<PermissionResponseDto> {
    return this.adminPermissionService.updatePermission(id, dto).match(
      (permission) => new PermissionResponseDto(permission),
      (error) => {
        throw AuthorizationErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Delete(':id')
  @Permissions('permission:delete')
  @ApiOperation({ summary: 'Delete a permission' })
  @ApiResponse({ status: 200, description: 'Permission deleted' })
  @ApiResponse({ status: 400, description: 'Permission is assigned to roles' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  deletePermission(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    return this.adminPermissionService.deletePermission(id).match(
      () => ({ message: 'Permission deleted successfully' }),
      (error) => {
        throw AuthorizationErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }
}

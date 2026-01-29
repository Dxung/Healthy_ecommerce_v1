import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../authorization/guards/permissions.guard';
import { Permissions } from '../authorization/decorators/permissions.decorator';
import { ADMIN_USER_SERVICE } from './tokens/user.token';
import type { IAdminUserService } from './admin-user.service.interface';
import { AdminUserListQueryDto } from './dto/admin-user-list-query.dto';
import { SuspendUserArgumentDto } from './dto/suspend-user-argument.dto';
import {
  AdminUserResponseDto,
  AdminUserListResponseDto,
} from './dto/admin-user-response.dto';
import { UserErrorHttpMapper } from './errors/user-errors-http.mapper';
import { ExceptionSource } from 'src/common/exception filters/exception-source';

@Controller('admin/users')
@UseGuards(AuthGuard, PermissionsGuard)
export class AdminUserController {
  constructor(
    @Inject(ADMIN_USER_SERVICE)
    private readonly adminUserService: IAdminUserService,
  ) {}

  /**
   * GET /admin/users
   * Get all users with pagination and filters
   */
  @Get()
  @Permissions('user:read')
  getAllUsers(@Query() query: AdminUserListQueryDto) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '20', 10);

    const filter = {
      search: query.search,
      status: query.status,
      fromDate: query.fromDate ? new Date(query.fromDate) : undefined,
      toDate: query.toDate ? new Date(query.toDate) : undefined,
    };

    return this.adminUserService.getAllUsers({ page, limit }, filter).match(
      (result) =>
        new AdminUserListResponseDto(result.items, {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        }),
      (error) => {
        throw UserErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  /**
   * GET /admin/users/:id
   * Get a specific user by ID
   */
  @Get(':id')
  @Permissions('user:read')
  getUserById(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminUserService.getUserById(id).match(
      (user) => ({
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        avatarUrl: user.avatarUrl,
        status: user.status,
        dateOfBirth: user.dateOfBirth?.toISOString() || null,
        gender: user.gender,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      }),
      (error) => {
        throw UserErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  /**
   * POST /admin/users/:id/suspend
   * Suspend a user account
   */
  @Post(':id/suspend')
  @Permissions('user:manage')
  suspendUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SuspendUserArgumentDto,
  ) {
    return this.adminUserService.suspendUser(id, dto.reason).match(
      () => ({ success: true, message: 'User suspended successfully' }),
      (error) => {
        throw UserErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  /**
   * POST /admin/users/:id/activate
   * Activate a suspended user account
   */
  @Post(':id/activate')
  @Permissions('user:manage')
  activateUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminUserService.activateUser(id).match(
      () => ({ success: true, message: 'User activated successfully' }),
      (error) => {
        throw UserErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  /**
   * DELETE /admin/users/:id
   * Soft delete a user account
   */
  @Delete(':id')
  @Permissions('user:delete')
  deleteUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminUserService.deleteUser(id).match(
      () => ({ success: true, message: 'User deleted successfully' }),
      (error) => {
        throw UserErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }
}

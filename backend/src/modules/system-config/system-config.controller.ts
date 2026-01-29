import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  Inject,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { ISystemConfigService } from './system-config.service.interface';
import { SYSTEM_CONFIG_SERVICE } from './tokens/system-config.token';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../authorization/guards/permissions.guard';
import { Permissions } from '../authorization/decorators/permissions.decorator';
import { SystemConfigErrorHttpMapper } from './errors/system-config-errors-http.mapper';
import { ExceptionSource } from 'src/common/exception filters/exception-source';
import {
  SystemConfigResponseDto,
  UpdateConfigArgumentDto,
  PlatformFeeResponseDto,
  UpdatePlatformFeeArgumentDto,
} from './dto/system-config.dto';

@ApiTags('Admin - System Configuration')
@Controller('admin/system-config')
@UseGuards(AuthGuard, PermissionsGuard)
export class SystemConfigController {
  constructor(
    @Inject(SYSTEM_CONFIG_SERVICE)
    private readonly systemConfigService: ISystemConfigService,
  ) {}

  @Get()
  @Permissions('system:read')
  @ApiOperation({ summary: 'Get all system configurations' })
  @ApiResponse({
    status: 200,
    description: 'List of all configurations',
    type: [SystemConfigResponseDto],
  })
  getAllConfigs(): Promise<SystemConfigResponseDto[]> {
    return this.systemConfigService.getAllConfigs().match(
      (configs) => SystemConfigResponseDto.fromList(configs),
      (error) => {
        throw SystemConfigErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Get(':key')
  @Permissions('system:read')
  @ApiOperation({ summary: 'Get configuration by key' })
  @ApiResponse({
    status: 200,
    description: 'Configuration details',
    type: SystemConfigResponseDto,
  })
  getConfig(
    @Param('key') key: string,
  ): Promise<SystemConfigResponseDto | null> {
    return this.systemConfigService.getConfig(key).match(
      (config) => (config ? new SystemConfigResponseDto(config) : null),
      (error) => {
        throw SystemConfigErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Put(':key')
  @Permissions('system:manage')
  @ApiOperation({ summary: 'Update configuration value' })
  @ApiResponse({
    status: 200,
    description: 'Configuration updated',
    type: SystemConfigResponseDto,
  })
  updateConfig(
    @Param('key') key: string,
    @Body() dto: UpdateConfigArgumentDto,
  ): Promise<SystemConfigResponseDto> {
    return this.systemConfigService
      .updateConfig(key, dto.value, dto.description)
      .match(
        (config) => new SystemConfigResponseDto(config),
        (error) => {
          throw SystemConfigErrorHttpMapper.toHttpException(
            error,
            ExceptionSource.CONTROLLER,
          );
        },
      );
  }

  // Convenience endpoints for platform fee

  @Get('platform-fee/current')
  @Permissions('system:read')
  @ApiOperation({ summary: 'Get current platform fee percentage' })
  @ApiResponse({
    status: 200,
    description: 'Current platform fee',
    type: PlatformFeeResponseDto,
  })
  getPlatformFee(): Promise<PlatformFeeResponseDto> {
    return this.systemConfigService.getPlatformFeePercent().match(
      (percent) => new PlatformFeeResponseDto(percent),
      (error) => {
        throw SystemConfigErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Put('platform-fee/update')
  @Permissions('system:manage')
  @ApiOperation({ summary: 'Update platform fee percentage' })
  @ApiResponse({
    status: 200,
    description: 'Platform fee updated',
    type: PlatformFeeResponseDto,
  })
  updatePlatformFee(
    @Body() dto: UpdatePlatformFeeArgumentDto,
  ): Promise<PlatformFeeResponseDto> {
    return this.systemConfigService
      .updatePlatformFeePercent(dto.platformFeePercent)
      .match(
        (percent) => new PlatformFeeResponseDto(percent),
        (error) => {
          throw SystemConfigErrorHttpMapper.toHttpException(
            error,
            ExceptionSource.CONTROLLER,
          );
        },
      );
  }
}

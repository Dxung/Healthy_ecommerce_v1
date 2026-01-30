import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ResultAsync, errAsync } from 'neverthrow';
import type {
  ISystemConfigService,
  ConfigEntry,
} from './system-config.service.interface';
import { ISystemConfigRepository } from './repository/system-config.repository.interface';
import { SystemConfig } from './models/system-config.model';
import { CONFIG_KEYS, DEFAULT_CONFIG } from './system-config.constants';
import { SYSTEM_CONFIG_REPOSITORY } from 'src/database/typeorm/tokens/database.token';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { SYSTEM_CONFIG_ERRORS } from './errors/system-config.errors';

/**
 * Database-backed system configuration service
 * Persists configuration in config_schema.system_configs table
 * Initializes default values on startup if not present
 */
@Injectable()
export class SystemConfigService implements ISystemConfigService, OnModuleInit {
  constructor(
    @Inject(SYSTEM_CONFIG_REPOSITORY)
    private readonly configRepository: ISystemConfigRepository,
  ) {}

  /**
   * Initialize default config values on module startup
   */
  async onModuleInit(): Promise<void> {
    await this.initializeDefaults();
  }

  private async initializeDefaults(): Promise<void> {
    const configDefinitions = [
      {
        key: CONFIG_KEYS.PLATFORM_FEE_PERCENT,
        description: 'Phí nền tảng tính trên mỗi đơn hàng (%)',
      },
      {
        key: CONFIG_KEYS.REVIEW_WINDOW_DAYS,
        description: 'Số ngày cho phép đánh giá sau khi đơn hàng hoàn thành',
      },
      {
        key: CONFIG_KEYS.ESCROW_HOLD_DAYS,
        description: 'Số ngày giữ tiền sau khi đơn hàng hoàn thành trước khi chuyển cho shop',
      },
      {
        key: CONFIG_KEYS.COIN_EARN_RATE_PERCENT,
        description: 'Tỷ lệ tích xu (% giá trị đơn hàng)',
      },
      {
        key: CONFIG_KEYS.COIN_MAX_USAGE_PERCENT,
        description: 'Phần trăm tối đa giá trị đơn hàng có thể thanh toán bằng xu',
      },
      {
        key: CONFIG_KEYS.DEFAULT_MAX_PRODUCT_SLOTS,
        description: 'Số lượng sản phẩm tối đa mà shop chưa có badge có thể đăng bán',
      },
    ];

    for (const def of configDefinitions) {
      const result = await this.configRepository.findByKey(def.key);

      if (result.isOk() && result.value === null) {
        const defaultValue = String(
          DEFAULT_CONFIG[def.key as keyof typeof DEFAULT_CONFIG],
        );

        const config = SystemConfig.create({
          key: def.key,
          value: defaultValue,
          description: def.description,
        });

        await this.configRepository.save(config);
      }
    }
  }

  private toConfigEntry(config: SystemConfig): ConfigEntry {
    return {
      key: config.key,
      value: config.value,
      description: config.description,
      updatedAt: config.updatedAt,
    };
  }

  getConfig(key: string): ResultAsync<ConfigEntry | null, DomainError> {
    return this.configRepository
      .findByKey(key)
      .map((config) => (config ? this.toConfigEntry(config) : null));
  }

  getAllConfigs(): ResultAsync<ConfigEntry[], DomainError> {
    return this.configRepository
      .findAll()
      .map((configs) => configs.map((c) => this.toConfigEntry(c)));
  }

  updateConfig(
    key: string,
    value: string,
    description?: string | null,
  ): ResultAsync<ConfigEntry, DomainError> {
    return this.configRepository.findByKey(key).andThen((existing) => {
      if (existing) {
        // Update existing
        existing.updateValue(value);
        if (description !== undefined) {
          existing.updateDescription(description);
        }
        return this.configRepository
          .save(existing)
          .map((saved) => this.toConfigEntry(saved));
      }

      // Create new
      const newConfig = SystemConfig.create({
        key,
        value,
        description: description ?? null,
      });
      return this.configRepository
        .save(newConfig)
        .map((saved) => this.toConfigEntry(saved));
    });
  }

  getPlatformFeePercent(): ResultAsync<number, DomainError> {
    return this.getConfig(CONFIG_KEYS.PLATFORM_FEE_PERCENT).map((config) => {
      if (!config) {
        return DEFAULT_CONFIG[CONFIG_KEYS.PLATFORM_FEE_PERCENT];
      }
      const value = parseFloat(config.value);
      return isNaN(value)
        ? DEFAULT_CONFIG[CONFIG_KEYS.PLATFORM_FEE_PERCENT]
        : value;
    });
  }

  updatePlatformFeePercent(percent: number): ResultAsync<number, DomainError> {
    if (percent < 0 || percent > 100) {
      return errAsync(
        createDomainError(SYSTEM_CONFIG_ERRORS.INVALID_VALUE, {
          cause: 'Platform fee percent must be between 0 and 100',
        }),
      );
    }

    return this.updateConfig(
      CONFIG_KEYS.PLATFORM_FEE_PERCENT,
      String(percent),
    ).map(() => percent);
  }
}

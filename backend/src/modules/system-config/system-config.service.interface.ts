import type { ResultAsync } from 'neverthrow';
import type { DomainError } from 'src/shared/types/domain-error.type';

export interface ConfigEntry {
  key: string;
  value: string;
  description: string | null;
  updatedAt: Date;
}

export interface ISystemConfigService {
  /**
   * Get a configuration value by key
   */
  getConfig(key: string): ResultAsync<ConfigEntry | null, DomainError>;

  /**
   * Get all configuration entries
   */
  getAllConfigs(): ResultAsync<ConfigEntry[], DomainError>;

  /**
   * Update a configuration value
   */
  updateConfig(
    key: string,
    value: string,
    description?: string | null,
  ): ResultAsync<ConfigEntry, DomainError>;

  /**
   * Get platform fee percentage (convenience method)
   */
  getPlatformFeePercent(): ResultAsync<number, DomainError>;

  /**
   * Update platform fee percentage (convenience method)
   */
  updatePlatformFeePercent(percent: number): ResultAsync<number, DomainError>;

  /**
   * Get coin max usage percentage (convenience method)
   * Returns the maximum percentage of order value that can be paid with coins
   */
  getCoinMaxUsagePercent(): ResultAsync<number, DomainError>;

  /**
   * Get shipping free threshold (convenience method)
   * Returns the minimum order subtotal value for free shipping (platform absorbs cost)
   */
  getShippingFreeThreshold(): ResultAsync<number, DomainError>;

  /**
   * Get order auto-complete days (convenience method)
   * Returns the number of days after delivery to auto-complete order if buyer doesn't confirm
   */
  getOrderAutoCompleteDays(): ResultAsync<number, DomainError>;
}

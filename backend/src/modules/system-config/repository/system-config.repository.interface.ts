import type { ResultAsync } from 'neverthrow';
import type { DomainError } from 'src/shared/types/domain-error.type';
import type { SystemConfig } from '../models/system-config.model';

export interface ISystemConfigRepository {
  /**
   * Find a configuration by key
   */
  findByKey(key: string): ResultAsync<SystemConfig | null, DomainError>;

  /**
   * Find all configurations
   */
  findAll(): ResultAsync<SystemConfig[], DomainError>;

  /**
   * Save (create or update) a configuration
   * Uses upsert based on config_key
   */
  save(config: SystemConfig): ResultAsync<SystemConfig, DomainError>;

  /**
   * Delete a configuration by key
   */
  deleteByKey(key: string): ResultAsync<void, DomainError>;
}

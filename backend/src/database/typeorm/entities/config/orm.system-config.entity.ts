import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * ORM Entity for system_configs table.
 * Stores key-value configuration pairs for the system.
 */
@Entity('system_configs', { schema: 'config_schema' })
@Index('idx_system_configs_key', ['configKey'])
export class ORMSystemConfig {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'config_key', type: 'varchar', length: 100, unique: true })
  configKey: string;

  @Column({ name: 'config_value', type: 'text' })
  configValue: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}

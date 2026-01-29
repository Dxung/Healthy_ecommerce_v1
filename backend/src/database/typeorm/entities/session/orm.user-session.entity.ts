import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  Check,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ORMUserCore } from '../user';

@Entity('user_sessions', { schema: 'session_schema' })
@Check('chk_expire_date', `"expire_at" > "created_at"`)
export class ORMUserSession {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'session_token', type: 'text', unique: true })
  sessionToken: string;

  @Column({ name: 'device_name', type: 'varchar', length: 255, nullable: true })
  deviceName: string | null;

  @Column({ name: 'device_type', type: 'varchar', length: 50, nullable: true })
  deviceType: string | null;

  @Column({ name: 'browser', type: 'varchar', length: 100, nullable: true })
  browser: string | null;

  @Column({ name: 'os', type: 'varchar', length: 100, nullable: true })
  os: string | null;

  @Column({ name: 'ip_address', type: 'varchar', length: 45 })
  ipAddress: string;

  @Column({ name: 'location', type: 'varchar', length: 255, nullable: true })
  location: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @Column({ name: 'last_active_at', type: 'timestamp' })
  lastActiveAt: Date;

  @Column({ name: 'expire_at', type: 'timestamp' })
  expireAt: Date;

  @ManyToOne(() => ORMUserCore, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: ORMUserCore;
}

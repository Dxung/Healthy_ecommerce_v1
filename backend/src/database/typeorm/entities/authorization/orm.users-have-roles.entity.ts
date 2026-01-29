import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ORMRole } from './orm.role.entity';
import { ORMUserCore } from '../user';

@Entity('users_have_roles', { schema: 'authorization_schema' })
export class ORMUsersHaveRoles {
  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId: string;

  @PrimaryColumn({ name: 'role_id', type: 'uuid' })
  roleId: string;

  @Column({ name: 'assigned_by', type: 'uuid', nullable: true })
  assignedBy: string | null;

  @CreateDateColumn({ name: 'assigned_at', type: 'timestamp' })
  assignedAt: Date;

  @Column({ name: 'expire_at', type: 'timestamp', nullable: true })
  expireAt: Date | null;

  // users_have_roles -> role
  @ManyToOne(() => ORMRole, (role) => role.usersHaveRoles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'role_id' })
  role: ORMRole;

  @ManyToOne(() => ORMUserCore, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: ORMUserCore;
}

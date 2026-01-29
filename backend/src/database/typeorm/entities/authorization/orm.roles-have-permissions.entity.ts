import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ORMRole } from './orm.role.entity';
import { ORMPermission } from './orm.permission.entity';

@Entity('roles_have_permissions', { schema: 'authorization_schema' })
export class ORMRolesHavePermissions {
  @PrimaryColumn({ name: 'role_id', type: 'uuid' })
  roleId: string;

  @PrimaryColumn({ name: 'permission_id', type: 'uuid' })
  permissionId: string;

  @Column({ name: 'note', type: 'varchar', length: 255, nullable: true })
  note: string | null;

  @Column({ name: 'granted_by', type: 'uuid', nullable: true })
  grantedBy: string | null;

  @CreateDateColumn({ name: 'granted_at', type: 'timestamp' })
  grantedAt: Date;

  // roles_have_permissions -> role
  @ManyToOne(() => ORMRole, (role) => role.roleHasPermissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'role_id' })
  role: ORMRole;

  // roles_have_permissions -> permission
  @ManyToOne(
    () => ORMPermission,
    (permission) => permission.rolesHavePermissions,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'permission_id' })
  permission: ORMPermission;
}

import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Unique,
} from 'typeorm';
import { ORMRolesHavePermissions } from './orm.roles-have-permissions.entity';

@Entity('permissions', { schema: 'authorization_schema' })
@Unique('unique_resource_action', ['resource', 'action'])
export class ORMPermission {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({
    name: 'permission_name',
    type: 'varchar',
    length: 100,
    unique: true,
  })
  permissionName: string;

  @Column({ name: 'resource', type: 'varchar', length: 100 })
  resource: string;

  @Column({ name: 'action', type: 'varchar', length: 50 })
  action: string;

  @Column({ name: 'description', type: 'varchar', length: 255, nullable: true })
  description: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  // permission -> roles_have_permissions
  @OneToMany(
    () => ORMRolesHavePermissions,
    (roleHasPermission) => roleHasPermission.permission,
  )
  rolesHavePermissions: ORMRolesHavePermissions[];
}

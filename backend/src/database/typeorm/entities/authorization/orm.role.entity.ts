import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ORMUsersHaveRoles } from './orm.users-have-roles.entity';
import { ORMRolesHavePermissions } from './orm.roles-have-permissions.entity';

@Entity('roles', { schema: 'authorization_schema' })
export class ORMRole {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'role_name', type: 'varchar', length: 50, unique: true })
  roleName: string;

  @Column({ name: 'description', type: 'varchar', length: 255, nullable: true })
  description: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  // role -> users_have_roles
  @OneToMany(() => ORMUsersHaveRoles, (userHasRole) => userHasRole.role)
  usersHaveRoles: ORMUsersHaveRoles[];

  // role -> roles_have_permissions
  @OneToMany(
    () => ORMRolesHavePermissions,
    (roleHasPermission) => roleHasPermission.role,
  )
  roleHasPermissions: ORMRolesHavePermissions[];
}

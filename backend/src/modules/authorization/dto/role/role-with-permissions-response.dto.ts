import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../models';
import { PermissionResponseDto } from '../permission/permission-response.dto';

export class RoleWithPermissionsResponseDto {
  @ApiProperty({ description: 'Role ID' })
  id: string;

  @ApiProperty({ description: 'Role name' })
  roleName: string;

  @ApiProperty({ description: 'Role description', nullable: true })
  description: string | null;

  @ApiProperty({ description: 'Whether the role is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  @ApiProperty({
    description: 'Permissions assigned to this role',
    type: [PermissionResponseDto],
  })
  permissions: PermissionResponseDto[];

  constructor(role: Role) {
    this.id = role.id;
    this.roleName = role.roleName;
    this.description = role.description;
    this.isActive = role.isActive;
    this.createdAt = role.createdAt;
    this.updatedAt = role.updatedAt;
    this.permissions = PermissionResponseDto.fromList(role.permissions);
  }
}

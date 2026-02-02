import { ApiProperty } from '@nestjs/swagger';
import { Permission } from '../../models';

export class PermissionResponseDto {
  @ApiProperty({ description: 'Permission ID' })
  id: string;

  @ApiProperty({ description: 'Permission name (resource:action format)' })
  permissionName: string;

  @ApiProperty({ description: 'Resource name' })
  resource: string;

  @ApiProperty({ description: 'Action name' })
  action: string;

  @ApiProperty({ description: 'Permission description', nullable: true })
  description: string | null;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  constructor(permission: Permission) {
    this.id = permission.id;
    this.permissionName = permission.permissionName;
    this.resource = permission.resource;
    this.action = permission.action;
    this.description = permission.description;
    this.createdAt = permission.createdAt;
    this.updatedAt = permission.updatedAt;
  }

  static fromList(permissions: Permission[]): PermissionResponseDto[] {
    return permissions.map(
      (permission) => new PermissionResponseDto(permission),
    );
  }
}

import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../models';

export class RoleResponseDto {
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

  constructor(role: Role) {
    this.id = role.id;
    this.roleName = role.roleName;
    this.description = role.description;
    this.isActive = role.isActive;
    this.createdAt = role.createdAt;
    this.updatedAt = role.updatedAt;
  }

  static fromList(roles: Role[]): RoleResponseDto[] {
    return roles.map((role) => new RoleResponseDto(role));
  }
}

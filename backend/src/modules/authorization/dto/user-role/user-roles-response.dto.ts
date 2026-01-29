import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserRoleAssignmentDto {
  @ApiProperty({ description: 'Role ID' })
  roleId: string;

  @ApiProperty({ description: 'Role name' })
  roleName: string;

  @ApiPropertyOptional({ description: 'Role description', nullable: true })
  description: string | null;

  @ApiProperty({ description: 'When the role was assigned' })
  assignedAt: Date;

  @ApiPropertyOptional({ description: 'When the role expires', nullable: true })
  expireAt: Date | null;

  @ApiPropertyOptional({ description: 'Who assigned the role', nullable: true })
  assignedBy: string | null;
}

export class UserRolesResponseDto {
  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({
    description: 'Roles assigned to the user',
    type: [UserRoleAssignmentDto],
  })
  roles: UserRoleAssignmentDto[];

  constructor(userId: string, roles: UserRoleAssignmentDto[]) {
    this.userId = userId;
    this.roles = roles;
  }
}

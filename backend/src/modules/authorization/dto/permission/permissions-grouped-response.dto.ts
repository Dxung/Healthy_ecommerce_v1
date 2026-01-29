import { ApiProperty } from '@nestjs/swagger';
import { Permission } from '../../models';
import { PermissionResponseDto } from './permission-response.dto';

export class PermissionsGroupedResponseDto {
  @ApiProperty({ description: 'Resource name' })
  resource: string;

  @ApiProperty({
    description: 'Permissions for this resource',
    type: [PermissionResponseDto],
  })
  permissions: PermissionResponseDto[];

  constructor(resource: string, permissions: Permission[]) {
    this.resource = resource;
    this.permissions = PermissionResponseDto.fromList(permissions);
  }

  static fromGroupedMap(
    grouped: Map<string, Permission[]>,
  ): PermissionsGroupedResponseDto[] {
    const result: PermissionsGroupedResponseDto[] = [];

    for (const [resource, permissions] of grouped) {
      result.push(new PermissionsGroupedResponseDto(resource, permissions));
    }

    // Sort by resource name
    return result.sort((a, b) => a.resource.localeCompare(b.resource));
  }
}

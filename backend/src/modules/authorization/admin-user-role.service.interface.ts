import { ResultAsync } from 'neverthrow';
import { DomainError } from 'src/shared/types/domain-error.type';
import { Role } from './models';
import { AssignRoleArgumentDto, UserRoleAssignmentDto } from './dto';

export interface IAdminUserRoleService {
  /**
   * Get all roles assigned to a user
   */
  getUserRoles(userId: string): ResultAsync<UserRoleAssignmentDto[], DomainError>;

  /**
   * Assign a role to a user
   * Note: The assignedBy user ID is obtained from ALS (set by AuthGuard)
   */
  assignRoleToUser(
    userId: string,
    dto: AssignRoleArgumentDto,
  ): ResultAsync<void, DomainError>;

  /**
   * Remove a role from a user
   */
  removeRoleFromUser(userId: string, roleId: string): ResultAsync<void, DomainError>;
}

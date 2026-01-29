import { SetMetadata } from '@nestjs/common';
import { PERMISSIONS_KEY } from '../constants/authorization.constants';

/**
 * Decorator to specify required permissions for a route.
 * Used with PermissionsGuard to enforce permission-based access control.
 *
 * @param permissions - Array of permission strings in format "resource:action"
 * @example
 * // Single permission
 * @Permissions('product:create')
 *
 * // Multiple permissions (user needs ANY of these)
 * @Permissions('product:update', 'product:delete')
 */
export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

/**
 * Metadata key for permissions decorator.
 * Used by PermissionsGuard to read required permissions from route metadata.
 */
export const PERMISSIONS_KEY = Symbol('PERMISSIONS_KEY');

/**
 * Cache TTL for user permissions (in milliseconds).
 * Non-admin users' permissions are cached for this duration.
 */
export const PERMISSIONS_CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Cache key prefix for user permissions.
 * Full key format: `${PERMISSIONS_CACHE_PREFIX}:${userId}`
 */
export const PERMISSIONS_CACHE_PREFIX = 'user_permissions';

/**
 * Roles that bypass permission caching.
 * Users with these roles always have fresh permissions queried from DB.
 * This ensures admin-level users always have up-to-date permissions.
 */
export const NO_CACHE_ROLES = ['admin', 'super_admin'] as const;

/**
 * Super admin role name.
 * Users with this role bypass ALL permission checks (hardcoded).
 */
export const SUPER_ADMIN_ROLE = 'super_admin' as const;

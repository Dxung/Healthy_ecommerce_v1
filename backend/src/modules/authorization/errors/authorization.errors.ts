export const AUTHORIZATION_ERRORS = {
  // Authentication/Permission errors
  PERMISSION_DENIED: {
    code: 'AUTHORIZATION_PERMISSION_DENIED',
    message: 'You do not have permission to perform this action.',
  },
  USER_NOT_AUTHENTICATED: {
    code: 'AUTHORIZATION_USER_NOT_AUTHENTICATED',
    message: 'User must be authenticated to access this resource.',
  },
  ADMIN_CANNOT_ACCESS_BUYER_FEATURE: {
    code: 'AUTHORIZATION_ADMIN_CANNOT_ACCESS_BUYER_FEATURE',
    message:
      'Administrators cannot access buyer features like cart or shop ownership.',
  },

  // Role errors
  ROLE_NOT_FOUND: {
    code: 'AUTHORIZATION_ROLE_NOT_FOUND',
    message: 'The specified role does not exist.',
  },
  ROLE_NAME_EXISTS: {
    code: 'AUTHORIZATION_ROLE_NAME_EXISTS',
    message: 'A role with this name already exists.',
  },
  ROLE_HAS_USERS: {
    code: 'AUTHORIZATION_ROLE_HAS_USERS',
    message: 'Cannot delete role that is assigned to users.',
  },
  ROLE_IS_SYSTEM: {
    code: 'AUTHORIZATION_ROLE_IS_SYSTEM',
    message: 'Cannot modify or delete system roles.',
  },

  // Permission errors
  PERMISSION_NOT_FOUND: {
    code: 'AUTHORIZATION_PERMISSION_NOT_FOUND',
    message: 'The specified permission does not exist.',
  },
  PERMISSION_NAME_EXISTS: {
    code: 'AUTHORIZATION_PERMISSION_NAME_EXISTS',
    message:
      'A permission with this resource:action combination already exists.',
  },
  PERMISSION_HAS_ROLES: {
    code: 'AUTHORIZATION_PERMISSION_HAS_ROLES',
    message: 'Cannot delete permission that is assigned to roles.',
  },

  // User-role assignment errors
  USER_ALREADY_HAS_ROLE: {
    code: 'AUTHORIZATION_USER_ALREADY_HAS_ROLE',
    message: 'User already has the specified role.',
  },
  USER_DOES_NOT_HAVE_ROLE: {
    code: 'AUTHORIZATION_USER_DOES_NOT_HAVE_ROLE',
    message: 'User does not have the specified role.',
  },
  USER_NOT_FOUND: {
    code: 'AUTHORIZATION_USER_NOT_FOUND',
    message: 'The specified user does not exist.',
  },

  // Role-permission assignment errors
  ROLE_ALREADY_HAS_PERMISSION: {
    code: 'AUTHORIZATION_ROLE_ALREADY_HAS_PERMISSION',
    message: 'Role already has the specified permission.',
  },
  ROLE_DOES_NOT_HAVE_PERMISSION: {
    code: 'AUTHORIZATION_ROLE_DOES_NOT_HAVE_PERMISSION',
    message: 'Role does not have the specified permission.',
  },
} as const satisfies Record<string, { code: string; message: string }>;

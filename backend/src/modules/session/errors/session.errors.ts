/**
 * Collection for Session module error definitions.
 * Provide standardized error codes and messages for session-related errors.
 */
export const SESSION_ERRORS = {
  INVALID_SESSION: {
    code: 'SESSION_INVALID_SESSION',
    message: 'Invalid or expired session. Please login again.',
  },
  SESSION_EXPIRED: {
    code: 'SESSION_SESSION_EXPIRED',
    message: 'Session has expired. Please login again.',
  },
  SESSION_NOT_FOUND: {
    code: 'SESSION_SESSION_NOT_FOUND',
    message: 'Session not found.',
  },
  UNAUTHORIZED_SESSION_DELETE: {
    code: 'SESSION_UNAUTHORIZED_SESSION_DELETE',
    message: 'You are not authorized to delete this session.',
  },
} as const satisfies Record<string, { code: string; message: string }>;

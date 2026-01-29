/**
 * Session configuration constants
 * These values define session expiration and cookie settings
 */

/**
 * Number of days until a session expires
 * Default: 30 days
 */
export const SESSION_EXPIRATION_DAYS = 30;

/**
 * Cookie maxAge in milliseconds (should match session expiration)
 * Calculated as: SESSION_EXPIRATION_DAYS * 24 hours * 60 minutes * 60 seconds * 1000 milliseconds
 */
export const SESSION_COOKIE_MAX_AGE =
  SESSION_EXPIRATION_DAYS * 24 * 60 * 60 * 1000;

/**
 * Name of the session cookie
 */
export const SESSION_COOKIE_NAME = 'sessionToken';

/**
 * Maximum number of concurrent sessions allowed per user
 * When this limit is reached, the oldest session will be deleted
 */
export const MAX_SESSIONS_PER_USER = 7;

/**
 * Threshold in minutes for updating session last_active_at
 * Only update if this many minutes have passed since last update
 * This prevents excessive DB writes on every request
 */
export const SESSION_UPDATE_THRESHOLD_MINUTES = 30;

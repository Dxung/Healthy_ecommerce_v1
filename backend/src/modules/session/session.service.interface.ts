import type { ResultAsync } from 'neverthrow';
import type { UserSession } from './models/user-session.model';
import type { DomainError } from 'src/shared/types/domain-error.type';
import { DeviceInfo } from 'src/common/interfaces/device-infos.interface';
import type { ISessionInfo } from './interfaces/session-info.interface';

export interface ISessionService {
  /**
   * Creates a new session for a user
   * @param userId - The ID of the user
   * @param ipAddress - IP address of the device
   * @param deviceInfo - Optional device information (deviceName, deviceType, browser, os, location)
   * @returns ResultAsync containing the created UserSession on success or DomainError on failure
   */
  createNewSession(
    userId: string,
    deviceInfo: DeviceInfo,
  ): ResultAsync<UserSession, DomainError>;

  /**
   * Finds an existing session or creates a new one for a user
   * - Searches for existing sessions with matching userId
   * - Compares ip+browser+os to find matching session
   * - If match found: updates last_active_at and returns existing sessionToken
   * - If no match: checks session count limit, deletes oldest if at max, creates new session
   * @param userId - The ID of the user
   * @param deviceInfo - Device information (ip, browser, os, deviceName, deviceType, location)
   * @returns ResultAsync containing the UserSession (existing or new) on success or DomainError on failure
   */
  findOrCreateSession(
    userId: string,
    deviceInfo: DeviceInfo,
  ): ResultAsync<UserSession, DomainError>;

  /**
   * Verifies a session token and optionally updates last_active_at
   * - Finds session by token
   * - Checks if session is valid (not expired)
   * - Updates last_active_at if >= 30 minutes have passed since last update
   * - Returns userId and sessionId if valid
   * @param sessionToken - The session token to verify
   * @returns ResultAsync containing {userId, sessionId} on success or DomainError on failure
   */
  verifyAndUpdateToken(
    sessionToken: string,
  ): ResultAsync<{ userId: string; sessionId: string }, DomainError>;

  /**
   * Deletes a selected session after verifying ownership
   * - Step 1: Find session by selectedSessionId and get userId from session
   * - Step 2: Get currentUserId from ALS store and compare with session userId
   * - Step 3: If they match, delete session; otherwise return UNAUTHORIZED_SESSION_DELETE error
   * @param selectedSessionId - The ID of the session to delete
   * @returns ResultAsync containing void on success or DomainError on failure
   */
  deleteSelectedSession(
    selectedSessionId: string,
  ): ResultAsync<void, DomainError>;

  /**
   * Gets all sessions for the current user
   * @returns ResultAsync containing array of ISessionInfo on success or DomainError on failure
   */
  getAllCurrentUserSessions(): ResultAsync<ISessionInfo[], DomainError>;

  /**
   * Deletes all sessions for a specific user
   * Used when resetting password to invalidate all existing sessions
   * @param userId - The ID of the user whose sessions should be deleted
   * @returns ResultAsync containing the number of deleted sessions on success or DomainError on failure
   */
  deleteAllUserSessions(userId: string): ResultAsync<number, DomainError>;

  /**
   * Deletes all sessions except the current one for the current user
   * Used when user wants to logout from all other devices
   * @returns ResultAsync containing the number of deleted sessions on success or DomainError on failure
   */
  deleteAllOtherSessions(): ResultAsync<number, DomainError>;
}

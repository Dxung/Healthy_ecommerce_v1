import { ResultAsync } from 'neverthrow';
import { UserSession } from '../models/user-session.model';
import { DomainError } from 'src/shared/types/domain-error.type';
import { ISessionInfo } from '../interfaces/session-info.interface';

export interface IUserSessionRepository {
  /**
   * Creates a new session record for a user.
   * @param userSession - The UserSession domain model containing session details.
   * @returns ResultAsync containing the created UserSession on success or DomainError on failure.
   */
  createSession(
    userSession: UserSession,
  ): ResultAsync<UserSession, DomainError>;

  /**
   * Finds all sessions for a user.
   * @param userId - The ID of the user.
   * @returns ResultAsync containing array of UserSessions on success or DomainError on failure.
   */
  findSessionsByUserId(userId: string): ResultAsync<UserSession[], DomainError>;

  /**
   * Updates a session record.
   * @param userSession - The UserSession domain model with updated data.
   * @returns ResultAsync containing the updated UserSession on success or DomainError on failure.
   */
  updateSession(
    userSession: UserSession,
  ): ResultAsync<UserSession, DomainError>;

  /**
   * Deletes a session by its ID.
   * @param sessionId - The ID of the session to delete.
   * @returns ResultAsync containing void on success or DomainError on failure.
   */
  deleteSession(sessionId: string): ResultAsync<void, DomainError>;

  /**
   * Finds a session by its token.
   * @param sessionToken - The session token to search for.
   * @returns ResultAsync containing the UserSession if found (and not expired), null otherwise, or DomainError on failure.
   */
  findSessionByToken(
    sessionToken: string,
  ): ResultAsync<UserSession | null, DomainError>;

  /**
   * Deletes all expired sessions from the database.
   * @returns ResultAsync containing the number of deleted sessions on success or DomainError on failure.
   */
  deleteExpiredSessions(): ResultAsync<number, DomainError>;

  /**
   * Finds a session by its ID.
   * @param sessionId - The ID of the session to find.
   * @returns ResultAsync containing the UserSession if found, null otherwise, or DomainError on failure.
   */
  findSessionById(
    sessionId: string,
  ): ResultAsync<UserSession | null, DomainError>;

  /**
   * Gets all sessions for the current user.
   * @returns ResultAsync containing array of ISessionInfo on success or DomainError on failure.
   */
  getAllCurrentUserSessions(): ResultAsync<ISessionInfo[], DomainError>;

  /**
   * Deletes all sessions for a specific user.
   * Used when changing password to invalidate all existing sessions.
   * @param userId - The ID of the user whose sessions should be deleted.
   * @returns ResultAsync containing the number of deleted sessions on success or DomainError on failure.
   */
  deleteAllUserSessions(userId: string): ResultAsync<number, DomainError>;

  /**
   * Deletes all sessions for the current user except the current session.
   * @param userId - The ID of the user.
   * @param currentSessionId - The ID of the current session to keep.
   * @returns ResultAsync containing the number of deleted sessions on success or DomainError on failure.
   */
  deleteAllOtherSessions(
    userId: string,
    currentSessionId: string,
  ): ResultAsync<number, DomainError>;
}

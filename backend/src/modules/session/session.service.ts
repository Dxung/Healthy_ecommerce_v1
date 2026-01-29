import { Inject, Injectable } from '@nestjs/common';
import { ISessionService } from './session.service.interface';
import { USER_SESSION_REPOSITORY } from 'src/database/typeorm/tokens/database.token';
import type { IUserSessionRepository } from './repository/user-session.repository.interface';
import type { DomainError } from 'src/shared/types/domain-error.type';
import { UserSession } from './models/user-session.model';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import { okAsync, ResultAsync } from 'neverthrow';
import { DeviceInfo } from 'src/common/interfaces/device-infos.interface';
import { v4 as uuidv4 } from 'uuid';
import {
  SESSION_EXPIRATION_DAYS,
  MAX_SESSIONS_PER_USER,
  SESSION_UPDATE_THRESHOLD_MINUTES,
} from './constants/session.constants';
import { SESSION_ERRORS } from './errors/session.errors';
import { createDomainError } from 'src/shared/types/domain-error.type';
import { errAsync } from 'neverthrow';
import { AsyncLocalStorage } from 'async_hooks';
import type { ITypeORMAlsStore } from 'src/shared/als/interfaces/als-store.interface';
import type { ISessionInfo } from './interfaces/session-info.interface';

@Injectable()
export class SessionService implements ISessionService {
  constructor(
    @Inject(USER_SESSION_REPOSITORY)
    private readonly userSessionRepository: IUserSessionRepository,
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
  ) {}

  /**
   * Creates a new session for a user
   * @param userId - The ID of the user
   * @param ipAddress - IP address of the device
   * @param deviceInfo - Optional device information (deviceName, deviceType, browser, os, location)
   * @returns ResultAsync containing the created UserSession on success or DomainError on failure
   */
  @WithPosition()
  createNewSession(
    userId: string,
    deviceInfo: DeviceInfo,
  ): ResultAsync<UserSession, DomainError> {
    const newSessionKey = uuidv4();

    const newSession = UserSession.createNewSession(
      userId,
      newSessionKey,
      deviceInfo.ip,
      SESSION_EXPIRATION_DAYS,
      {
        deviceName: deviceInfo.deviceName,
        deviceType: deviceInfo.devicetype,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        location: deviceInfo.location,
      },
    );

    return this.userSessionRepository.createSession(newSession);
  }

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
  @WithPosition()
  findOrCreateSession(
    userId: string,
    deviceInfo: DeviceInfo,
  ): ResultAsync<UserSession, DomainError> {
    return this.userSessionRepository
      .findSessionsByUserId(userId)
      .andThen((sessions) => {
        // Find matching session based on ip+browser+os
        const matchingSession = sessions.find(
          (session) =>
            session.ipAddress === deviceInfo.ip &&
            session.browser === deviceInfo.browser &&
            session.os === deviceInfo.os,
        );

        if (matchingSession) {
          // Update last_active_at and return existing session
          matchingSession.updateLastActive();
          return this.userSessionRepository.updateSession(matchingSession);
        }

        // No matching session found - need to create new one
        // Check if we're at the session limit
        if (sessions.length >= MAX_SESSIONS_PER_USER) {
          // Find oldest session (by last_active_at)
          const oldestSession = sessions.reduce((oldest, current) =>
            current.lastActiveAt < oldest.lastActiveAt ? current : oldest,
          );

          // Delete oldest session first
          return this.userSessionRepository
            .deleteSession(oldestSession.id)
            .andThen(() => this.createNewSession(userId, deviceInfo));
        }

        // Not at limit, just create new session
        return this.createNewSession(userId, deviceInfo);
      });
  }

  /**
   * Verifies a session token and optionally updates last_active_at
   * - Finds session by token
   * - Checks if session is valid (not expired)
   * - Updates last_active_at if >= 30 minutes have passed since last update
   * - Returns userId and sessionId if valid
   * @param sessionToken - The session token to verify
   * @returns ResultAsync containing {userId, sessionId} on success or DomainError on failure
   */
  @WithPosition()
  verifyAndUpdateToken(
    sessionToken: string,
  ): ResultAsync<{ userId: string; sessionId: string }, DomainError> {
    return (
      this.userSessionRepository
        //Tìm kiếm session thông qua token. Kết quả trả về có thể là tìm thấy hoặc không tìm thấy
        .findSessionByToken(sessionToken)
        .andThen((session) => {
          //Nếu req thành công nhưng session không tồn tại (không tìm thấy) thì trả về lỗi INVALID_SESSION
          if (!session) {
            return errAsync(
              createDomainError(SESSION_ERRORS.INVALID_SESSION, {
                cause: SESSION_ERRORS.INVALID_SESSION.message,
              }),
            );
          }

          //Nếu req thành công và tìm thấy session thì kiểm tra tính hợp lệ của session (chưa hết hạn)
          //Nếu thực sự đã hết hạn thì cần xóa token này trong DB và trả về lỗi SESSION_EXPIRED nếu xóa thành công
          if (session.isExpired()) {
            //Xóa session đã hết hạn khỏi DB
            return this.userSessionRepository
              .deleteSession(session.id)
              .andThen(() =>
                //Sau khi xóa thành công, trả về lỗi SESSION_EXPIRED
                errAsync(
                  createDomainError(SESSION_ERRORS.SESSION_EXPIRED, {
                    cause: SESSION_ERRORS.SESSION_EXPIRED.message,
                  }),
                ),
              );
          }

          //Nếu còn hợp lệ, thì kiểm tra xem có nên update lại last_active_at không (khác với thời gian ngưỡng là tính từ lúc khởi tạo đến giờ)
          const now = new Date();
          const timeSinceLastActive =
            now.getTime() - session.lastActiveAt.getTime();
          const thresholdMs = SESSION_UPDATE_THRESHOLD_MINUTES * 60 * 1000;

          //Nếu như đã đến lúc update lại last_active_at thì mới thực hiện update và trả về userId và sessionId
          if (timeSinceLastActive >= thresholdMs) {
            session.updateLastActive();
            return this.userSessionRepository
              .updateSession(session)
              .map((updatedSession) => ({
                userId: updatedSession.userId,
                sessionId: updatedSession.id,
              }));
          }

          // No update needed, just return userId and sessionId
          return okAsync({ userId: session.userId, sessionId: session.id });
        })
    );
  }

  /**
   * Deletes a selected session after verifying ownership
   * Step 1: Find session by selectedSessionId and get userId
   * Step 2: Get currentUserId from ALS and compare
   * Step 3: If match, delete session; otherwise return error
   * @param selectedSessionId - The ID of the session to delete
   * @returns ResultAsync containing void on success or DomainError on failure
   */
  @WithPosition()
  deleteSelectedSession(
    selectedSessionId: string,
  ): ResultAsync<void, DomainError> {
    // Step 1: Find session by ID and get userId
    return this.userSessionRepository
      .findSessionById(selectedSessionId)
      .andThen((session) => {
        // If session not found, return SESSION_NOT_FOUND error
        if (!session) {
          return errAsync(
            createDomainError(SESSION_ERRORS.SESSION_NOT_FOUND, {
              cause: SESSION_ERRORS.SESSION_NOT_FOUND.message,
            }),
          );
        }

        // Step 2: Get currentUserId from ALS store
        const store = this.als.getStore();
        const currentUserId = store?.userId;

        // If no userId in ALS (shouldn't happen with AuthGuard), return error
        if (!currentUserId) {
          return errAsync(
            createDomainError(SESSION_ERRORS.UNAUTHORIZED_SESSION_DELETE, {
              cause: SESSION_ERRORS.UNAUTHORIZED_SESSION_DELETE.message,
            }),
          );
        }

        // Compare userId from session with currentUserId from ALS
        if (session.userId !== currentUserId) {
          return errAsync(
            createDomainError(SESSION_ERRORS.UNAUTHORIZED_SESSION_DELETE, {
              cause: SESSION_ERRORS.UNAUTHORIZED_SESSION_DELETE.message,
            }),
          );
        }

        // Step 3: UserIds match, proceed to delete the session
        return this.userSessionRepository.deleteSession(selectedSessionId);
      });
  }

  /**
   * Gets all sessions for the current user
   * @returns ResultAsync containing array of ISessionInfo on success or DomainError on failure
   */
  @WithPosition()
  getAllCurrentUserSessions(): ResultAsync<ISessionInfo[], DomainError> {
    return this.userSessionRepository.getAllCurrentUserSessions();
  }

  /**
   * Deletes all sessions for a specific user
   * Used when resetting password to invalidate all existing sessions
   * @param userId - The ID of the user whose sessions should be deleted
   * @returns ResultAsync containing the number of deleted sessions on success or DomainError on failure
   */
  @WithPosition()
  deleteAllUserSessions(userId: string): ResultAsync<number, DomainError> {
    return this.userSessionRepository.deleteAllUserSessions(userId);
  }

  /**
   * Deletes all sessions except the current one for the current user
   * Used when user wants to logout from all other devices
   * @returns ResultAsync containing the number of deleted sessions on success or DomainError on failure
   */
  @WithPosition()
  deleteAllOtherSessions(): ResultAsync<number, DomainError> {
    // Get current user and session from ALS
    const store = this.als.getStore();
    const userId = store?.userId;
    const sessionId = store?.sessionId;

    // If no userId or sessionId in ALS (shouldn't happen with AuthGuard), return error
    if (!userId || !sessionId) {
      return errAsync(
        createDomainError(SESSION_ERRORS.UNAUTHORIZED_SESSION_DELETE, {
          cause: SESSION_ERRORS.UNAUTHORIZED_SESSION_DELETE.message,
        }),
      );
    }

    // Delete all sessions except the current one
    return this.userSessionRepository.deleteAllOtherSessions(userId, sessionId);
  }
}

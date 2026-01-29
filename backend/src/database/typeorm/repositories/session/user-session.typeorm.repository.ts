import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { IUserSessionRepository } from 'src/modules/session/repository/user-session.repository.interface';
import { ITypeORMAlsStore } from 'src/shared/als/interfaces/als-store.interface';
import { DataSource, LessThanOrEqual, Not } from 'typeorm';
import { ORMUserSession } from '../../entities';
import { UserSession } from 'src/modules/session/models/user-session.model';
import { ResultAsync, errAsync, okAsync } from 'neverthrow';
import {
  createDomainError,
  DomainError,
} from 'src/shared/types/domain-error.type';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import { ORMUserSessionMapper } from '../../mappers/user-session.mapper.orm';
import { SHARED_ERRORS } from 'src/shared/errors/shared.errors';
import { ISessionInfo } from 'src/modules/session/interfaces/session-info.interface';

@Injectable()
export class OrmUserSessionRepository implements IUserSessionRepository {
  constructor(
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Creates a new session record for a user.
   * @param userSession - The UserSession domain model containing session details.
   * @returns ResultAsync containing the created UserSession on success or DomainError on failure.
   */
  @WithPosition()
  createSession(
    userSession: UserSession,
  ): ResultAsync<UserSession, DomainError> {
    const repo = this.getUserSessionRepository();
    const ormEntity = ORMUserSessionMapper.toOrm(userSession);
    return ResultAsync.fromPromise(repo.save(ormEntity), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((createdOrmEntity) =>
      ORMUserSessionMapper.toDomain(createdOrmEntity),
    );
  }

  /**
   * Finds all sessions for a user.
   * @param userId - The ID of the user.
   * @returns ResultAsync containing array of UserSessions on success or DomainError on failure.
   */
  @WithPosition()
  findSessionsByUserId(
    userId: string,
  ): ResultAsync<UserSession[], DomainError> {
    const repo = this.getUserSessionRepository();
    return ResultAsync.fromPromise(repo.find({ where: { userId } }), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormSessions) =>
      ormSessions.map((ormSession) =>
        ORMUserSessionMapper.toDomain(ormSession),
      ),
    );
  }

  /**
   * Updates a session record.
   * @param userSession - The UserSession domain model with updated data.
   * @returns ResultAsync containing the updated UserSession on success or DomainError on failure.
   */
  @WithPosition()
  updateSession(
    userSession: UserSession,
  ): ResultAsync<UserSession, DomainError> {
    const repo = this.getUserSessionRepository();
    const ormEntity = ORMUserSessionMapper.toOrm(userSession);

    return ResultAsync.fromPromise(
      repo.update(userSession.id, ormEntity),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).andThen(() =>
      ResultAsync.fromPromise(
        repo.findOne({ where: { id: userSession.id } }),
        (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
      ).andThen((updatedOrmEntity) => {
        if (!updatedOrmEntity) {
          return errAsync(
            createDomainError(SHARED_ERRORS.DB_ERROR, {
              cause: SHARED_ERRORS.DB_ERROR.message,
            }),
          );
        }
        return okAsync(ORMUserSessionMapper.toDomain(updatedOrmEntity));
      }),
    );
  }

  /**
   * Deletes a session by its ID.
   * @param sessionId - The ID of the session to delete.
   * @returns ResultAsync containing void on success or DomainError on failure.
   */
  @WithPosition()
  deleteSession(sessionId: string): ResultAsync<void, DomainError> {
    const repo = this.getUserSessionRepository();
    return ResultAsync.fromPromise(repo.delete(sessionId), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map(() => undefined);
  }

  /**
   * Finds a session by its token.
   * @param sessionToken - The session token to search for.
   * @returns ResultAsync containing the UserSession if found (and not expired), null otherwise, or DomainError on failure.
   */
  @WithPosition()
  findSessionByToken(
    sessionToken: string,
  ): ResultAsync<UserSession | null, DomainError> {
    const repo = this.getUserSessionRepository();
    return ResultAsync.fromPromise(
      //Tìm sessionEntity với sessionToken đã cho
      repo.findOne({ where: { sessionToken } }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
      //Nếu như tìm được, thì trả về ormSession (entity), nếu có lỗi thì trả về DomainError
    ).map((ormSession) => {
      //Trong trường hợp tìm được, nhưng ormSession là null (không tìm thấy) thì trả về null (thành công req, nhưng không tìm thấy)
      if (!ormSession) {
        return null;
      }
      //nếu tìm thấy, thì chuyển ormSession (entity) sang domain model (session)
      const session = ORMUserSessionMapper.toDomain(ormSession);

      //Không cần kiểm tra tình trạng hết hạn ở đây vì đã được xử lý trong tầng service

      //Nếu tìm thấy và session hợp lệ, trả về session
      return session;
    });
  }

  /**
   * Deletes all expired sessions from the database.
   * @returns ResultAsync containing the number of deleted sessions on success or DomainError on failure.
   */
  @WithPosition()
  deleteExpiredSessions(): ResultAsync<number, DomainError> {
    const repo = this.getUserSessionRepository();
    const now = new Date();

    return ResultAsync.fromPromise(
      //Xóa tất cả sessions có expireAt <= now (đã hết hạn)
      repo.delete({ expireAt: LessThanOrEqual(now) }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((deleteResult) => deleteResult.affected ?? 0);
  }

  /**
   * Finds a session by its ID.
   * @param sessionId - The ID of the session to find.
   * @returns ResultAsync containing the UserSession if found, null otherwise, or DomainError on failure.
   */
  @WithPosition()
  findSessionById(
    sessionId: string,
  ): ResultAsync<UserSession | null, DomainError> {
    const repo = this.getUserSessionRepository();
    return ResultAsync.fromPromise(
      //Tìm sessionEntity với sessionId đã cho
      repo.findOne({ where: { id: sessionId } }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormSession) => {
      //Nếu không tìm thấy, trả về null
      if (!ormSession) {
        return null;
      }
      //Nếu tìm thấy, chuyển sang domain model và trả về
      return ORMUserSessionMapper.toDomain(ormSession);
    });
  }

  /**
   * Gets all sessions for the current user.
   * @returns ResultAsync containing array of ISessionInfo on success or DomainError on failure.
   */
  @WithPosition()
  getAllCurrentUserSessions(): ResultAsync<ISessionInfo[], DomainError> {
    const store = this.als.getStore();
    const userId = store?.userId;

    if (!userId) {
      return errAsync(
        createDomainError(SHARED_ERRORS.ALS_STORE_NOT_FOUND, {
          cause: SHARED_ERRORS.ALS_STORE_NOT_FOUND.message,
        }),
      );
    }

    const repo = this.getUserSessionRepository();
    return ResultAsync.fromPromise(repo.find({ where: { userId } }), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormSessions) =>
      ormSessions.map((ormSession) => {
        const session = ORMUserSessionMapper.toDomain(ormSession);
        return {
          sessionId: session.id,
          deviceName: session.deviceName,
          deviceType: session.deviceType,
          browser: session.browser,
          os: session.os,
          ip: session.ipAddress,
          location: session.location,
          createdAt: session.createdAt,
          lastActiveAt: session.lastActiveAt,
        } as ISessionInfo;
      }),
    );
  }

  /**
   * Deletes all sessions for a specific user.
   * Used when changing password to invalidate all existing sessions.
   * @param userId - The ID of the user whose sessions should be deleted.
   * @returns ResultAsync containing the number of deleted sessions on success or DomainError on failure.
   */
  @WithPosition()
  deleteAllUserSessions(userId: string): ResultAsync<number, DomainError> {
    const repo = this.getUserSessionRepository();
    return ResultAsync.fromPromise(repo.delete({ userId }), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((deleteResult) => deleteResult.affected ?? 0);
  }

  /**
   * Deletes all sessions for the current user except the current session.
   * @param userId - The ID of the user.
   * @param currentSessionId - The ID of the current session to keep.
   * @returns ResultAsync containing the number of deleted sessions on success or DomainError on failure.
   */
  @WithPosition()
  deleteAllOtherSessions(
    userId: string,
    currentSessionId: string,
  ): ResultAsync<number, DomainError> {
    const repo = this.getUserSessionRepository();
    return ResultAsync.fromPromise(
      repo.delete({ userId, id: Not(currentSessionId) }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((deleteResult) => deleteResult.affected ?? 0);
  }

  /**
   * Gets the current EntityManager from AsyncLocalStorage, if available.
   * @returns The EntityManager or null if not found
   */
  private getEntityManager() {
    if (!this.als) return null;
    const store = this.als.getStore();
    if (!store || !store.ctx) return null;
    return store.ctx;
  }

  private getUserSessionRepository() {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return em.getRepository(ORMUserSession);
  }
}

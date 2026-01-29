import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { USER_SESSION_REPOSITORY } from 'src/database/typeorm/tokens/database.token';
import type { IUserSessionRepository } from './repository/user-session.repository.interface';

/**
 * SessionCleanupService - Handles automated cleanup of expired sessions
 *
 * Runs a cron job daily at midnight to delete all expired sessions from the database.
 * This prevents the session table from growing indefinitely with stale data.
 */
@Injectable()
export class SessionCleanupService {
  //Bởi vì service này không đi qua request nên không dùng ALS logger được, phải dùng als thường
  private readonly logger = new Logger(SessionCleanupService.name);

  constructor(
    @Inject(USER_SESSION_REPOSITORY)
    private readonly userSessionRepository: IUserSessionRepository,
  ) {}

  /**
   * Cron job that runs daily at midnight (00:00:00) to clean up expired sessions.
   * Uses CronExpression.EVERY_DAY_AT_MIDNIGHT for readability.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'delete-expired-sessions',
    timeZone: 'Asia/Ho_Chi_Minh', // Vietnam timezone
  })
  async handleExpiredSessionCleanup(): Promise<void> {
    this.logger.log('Starting expired session cleanup...');

    const result = await this.userSessionRepository.deleteExpiredSessions();

    result.match(
      (deletedCount) => {
        this.logger.log(
          `Successfully deleted ${deletedCount} expired session(s)`,
        );
      },
      (error) => {
        this.logger.error(
          `Failed to delete expired sessions: ${error.message}, with code: ${error.code}`,
        );
      },
    );
  }
}

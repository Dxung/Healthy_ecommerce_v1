import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IPaymentTransactionRepository } from '../repository/payment-transaction.repository.interface';
import { PAYMENT_TRANSACTION_REPOSITORY } from 'src/database/typeorm/tokens/database.token';

/**
 * PaymentTimeoutCronjob - Handles automated cleanup of expired pending payments
 *
 * Runs every 10 minutes to cancel pending payments that have exceeded the timeout period.
 * Default timeout is 15 minutes.
 */
@Injectable()
export class PaymentTimeoutCronjob {
  private readonly logger = new Logger(PaymentTimeoutCronjob.name);
  private readonly timeoutMinutes = 15;

  constructor(
    @Inject(PAYMENT_TRANSACTION_REPOSITORY)
    private readonly paymentTransactionRepository: IPaymentTransactionRepository,
  ) {}

  /**
   * Cron job that runs every 10 minutes to cancel expired pending payments.
   */
  @Cron(CronExpression.EVERY_10_MINUTES, {
    name: 'cancel-expired-payments',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async handleExpiredPayments(): Promise<void> {
    this.logger.log('Starting expired payment cleanup...');

    const result = await this.paymentTransactionRepository.cancelExpiredPayments(
      this.timeoutMinutes,
    );

    result.match(
      (cancelledCount) => {
        if (cancelledCount > 0) {
          this.logger.log(`Cancelled ${cancelledCount} expired payment(s)`);
        } else {
          this.logger.debug('No expired payments to cancel');
        }
      },
      (error) => {
        this.logger.error(
          `Failed to cancel expired payments: ${error.message}, code: ${error.code}`,
        );
      },
    );
  }
}

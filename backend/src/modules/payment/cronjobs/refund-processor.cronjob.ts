import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IOrderService } from 'src/modules/order/order.service.interface';
import { ORDER_SERVICE } from 'src/modules/order/tokens/order.token';

/**
 * RefundProcessorCronjob - Handles edge cases where refunds were not processed
 *
 * Runs every 10 minutes to find cancelled orders with holding escrows
 * and process refunds that may have failed.
 *
 * Note: This is a backup mechanism. Normal refunds should be processed
 * synchronously when an order is cancelled.
 */
@Injectable()
export class RefundProcessorCronjob {
  private readonly logger = new Logger(RefundProcessorCronjob.name);

  constructor(
    @Inject(ORDER_SERVICE)
    private readonly orderService: IOrderService,
  ) {}

  /**
   * Cron job that runs every 10 minutes to process failed refunds.
   * This is a safety net for edge cases where refunds were not processed properly.
   */
  @Cron(CronExpression.EVERY_10_MINUTES, {
    name: 'process-failed-refunds',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async handleFailedRefunds(): Promise<void> {
    this.logger.log('Starting failed refund processing...');

    const result = await this.orderService.processMissedRefunds();

    if (result.isErr()) {
      this.logger.error(
        `Failed to process missed refunds: ${result.error.message}`,
      );
      return;
    }

    const processedCount = result.value;
    if (processedCount > 0) {
      this.logger.log(`Processed ${processedCount} missed refunds`);
    } else {
      this.logger.debug('No missed refunds to process');
    }
  }
}

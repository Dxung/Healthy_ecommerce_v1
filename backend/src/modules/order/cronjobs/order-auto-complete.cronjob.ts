import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AsyncLocalStorage } from 'async_hooks';
import { v7 as uuidv7 } from 'uuid';
import type { IOrderService } from '../order.service.interface';
import type { ISystemConfigService } from 'src/modules/system-config/system-config.service.interface';
import { ORDER_SERVICE } from '../tokens/order.token';
import { SYSTEM_CONFIG_SERVICE } from 'src/modules/system-config/tokens/system-config.token';
import { ITypeORMAlsStore } from 'src/shared/als/interfaces/als-store.interface';

/**
 * OrderAutoCompleteCronjob - Auto-completes orders that have been delivered for N days
 *
 * Runs daily at 2:00 AM to:
 * 1. Get auto-complete days from system config
 * 2. Find orders with status=SHIPPING that were shipped N+ days ago
 * 3. For each order (in UoW transaction):
 *    - Update status to COMPLETED
 *    - Credit coins to buyer
 *    - Release escrow to shop + platform
 */
@Injectable()
export class OrderAutoCompleteCronjob {
  private readonly logger = new Logger(OrderAutoCompleteCronjob.name);

  constructor(
    @Inject(ORDER_SERVICE)
    private readonly orderService: IOrderService,
    @Inject(SYSTEM_CONFIG_SERVICE)
    private readonly systemConfigService: ISystemConfigService,
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
  ) {}

  /**
   * Cron job that runs daily at 2:00 AM to auto-complete delivered orders.
   * Creates ALS context to enable UoW transaction support.
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM, {
    name: 'order-auto-complete',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async handleAutoComplete(): Promise<void> {
    // Create ALS store for cronjob context (similar to what middleware does for HTTP requests)
    // This enables UoW transaction support in services
    const store: ITypeORMAlsStore = {
      requestId: uuidv7(),
      ctx: null,
    };

    await this.als.run(store, () => this.processAutoComplete());
  }

  /**
   * Internal method that contains the actual auto-complete logic.
   * Runs within ALS context.
   */
  private async processAutoComplete(): Promise<void> {
    this.logger.log('Starting order auto-complete processing...');

    // Get auto-complete days from system config
    const configResult =
      await this.systemConfigService.getOrderAutoCompleteDays();

    await configResult.match(
      async (autoCompleteDays) => {
        this.logger.log(`Auto-complete days configured: ${autoCompleteDays}`);

        // Process auto-complete for orders
        const result =
          await this.orderService.autoCompleteOrders(autoCompleteDays);

        result.match(
          (count) => {
            if (count > 0) {
              this.logger.log(`Successfully auto-completed ${count} order(s)`);
            } else {
              this.logger.debug('No orders to auto-complete');
            }
          },
          (error) => {
            this.logger.error(
              `Failed to auto-complete orders: ${error.message}, code: ${error.code}`,
            );
          },
        );
      },
      (error) => {
        this.logger.error(
          `Failed to get auto-complete days config: ${error.message}`,
        );
      },
    );
  }
}

import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IEscrowService } from '../services/escrow.service.interface';
import { ESCROW_SERVICE } from '../tokens/payment.token';

/**
 * EscrowReleaseCronjob - Handles automated escrow releases for completed orders
 *
 * Runs every 5 minutes to:
 * 1. Find holding escrows for completed orders and create pending releases
 * 2. Process pending releases with exponential backoff retry
 */
@Injectable()
export class EscrowReleaseCronjob {
  private readonly logger = new Logger(EscrowReleaseCronjob.name);

  constructor(
    @Inject(ESCROW_SERVICE)
    private readonly escrowService: IEscrowService,
  ) {}

  /**
   * Cron job that runs every 5 minutes to process escrow releases.
   */
  @Cron(CronExpression.EVERY_5_MINUTES, {
    name: 'process-escrow-releases',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async handleEscrowReleases(): Promise<void> {
    this.logger.log('Starting escrow release processing...');

    // Step 1: Find holding escrows for completed orders and create pending releases
    const createResult = await this.escrowService.processCompletedOrderReleases();

    createResult.match(
      (count) => {
        if (count > 0) {
          this.logger.log(`Created ${count} pending release(s) for completed orders`);
        }
      },
      (error) => {
        this.logger.error(
          `Failed to create pending releases: ${error.message}, code: ${error.code}`,
        );
      },
    );

    // Step 2: Process pending releases with retry
    const processResult = await this.escrowService.processPendingReleasesWithRetry();

    processResult.match(
      (count) => {
        if (count > 0) {
          this.logger.log(`Successfully processed ${count} escrow release(s)`);
        } else {
          this.logger.debug('No pending releases to process');
        }
      },
      (error) => {
        this.logger.error(
          `Failed to process pending releases: ${error.message}, code: ${error.code}`,
        );
      },
    );
  }
}

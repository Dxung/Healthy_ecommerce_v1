import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ResultAsync, okAsync } from 'neverthrow';
import type { IOrderRepository } from '../repository/order.repository.interface';
import type { IOrderService } from '../order.service.interface';
import type { IPaymentTransactionRepository } from 'src/modules/payment/repository/payment-transaction.repository.interface';
import type { IVnpayService } from 'src/modules/payment/services/vnpay.service.interface';
import { ORDER_REPOSITORY } from 'src/database/typeorm/tokens/database.token';
import { ORDER_SERVICE } from '../tokens/order.token';
import { PAYMENT_TRANSACTION_REPOSITORY } from 'src/database/typeorm/tokens/database.token';
import { VNPAY_SERVICE } from 'src/modules/payment/tokens/payment.token';
import {
  ORDER_PAYMENT_TIMEOUT_MINUTES,
  ORDER_PAYMENT_CHECK_THRESHOLD_MINUTES,
} from '../constants/order.constants';
import { Order } from '../models/order.model';

/**
 * OrderPaymentTimeoutCronjob - Handles automated verification and cancellation of pending orders
 *
 * Runs every 15 minutes to:
 * 1. Find orders with status=PENDING, paymentStatus=PENDING, older than threshold
 * 2. Query VNPay API to verify payment status
 * 3. If paid → process payment success (create escrow, mark paid)
 * 4. If not paid and order age > timeout → cancel order
 */
@Injectable()
export class OrderPaymentTimeoutCronjob {
  private readonly logger = new Logger(OrderPaymentTimeoutCronjob.name);

  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    @Inject(ORDER_SERVICE)
    private readonly orderService: IOrderService,
    @Inject(PAYMENT_TRANSACTION_REPOSITORY)
    private readonly paymentTransactionRepository: IPaymentTransactionRepository,
    @Inject(VNPAY_SERVICE)
    private readonly vnpayService: IVnpayService,
  ) {}

  /**
   * Cron job that runs every 15 minutes to check and process pending orders.
   */
  @Cron(CronExpression.EVERY_10_MINUTES, {
    name: 'order-payment-timeout-check',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async handlePendingOrdersCheck(): Promise<void> {
    this.logger.log('Starting pending orders payment check...');

    const result = await this.orderRepository.findPendingOrdersForPaymentCheck(
      ORDER_PAYMENT_CHECK_THRESHOLD_MINUTES,
    );

    await result.match(
      async (orders) => {
        if (orders.length === 0) {
          this.logger.debug('No pending orders to check');
          return;
        }

        this.logger.log(`Found ${orders.length} pending order(s) to check`);

        let processedCount = 0;
        let cancelledCount = 0;
        let paidCount = 0;

        for (const order of orders) {
          const processResult = await this.processOrder(order);
          processResult.match(
            (action) => {
              processedCount++;
              if (action === 'cancelled') cancelledCount++;
              if (action === 'paid') paidCount++;
            },
            (error) => {
              this.logger.error(
                `Failed to process order ${order.id}: ${error.message}`,
              );
            },
          );
        }

        this.logger.log(
          `Processed ${processedCount} order(s): ${paidCount} paid, ${cancelledCount} cancelled`,
        );
      },
      (error) => {
        this.logger.error(`Failed to fetch pending orders: ${error.message}`);
      },
    );
  }

  /**
   * Process a single order: verify with VNPay and take appropriate action
   */
  private processOrder(
    order: Order,
  ): ResultAsync<'paid' | 'cancelled' | 'pending', Error> {
    // Get payment transaction for this order
    return this.paymentTransactionRepository
      .findByOrderId(order.id)
      .andThen((transaction) => {
        if (!transaction) {
          // No payment transaction found, check if order should be cancelled
          return this.checkAndCancelIfTimeout(order);
        }

        // Query VNPay to verify payment status
        return this.vnpayService
          .queryTransaction({
            txnRef: transaction.vnpayTxnRef,
            transactionDate: transaction.createdAt,
            ipAddress: '127.0.0.1',
          })
          .andThen((vnpayResult) => {
            if (vnpayResult.isSuccess) {
              // Payment was successful, process it
              this.logger.log(
                `VNPay confirms payment success for order ${order.id}`,
              );
              return this.orderService
                .processVnpayPaymentSuccess(order.id)
                .map(() => 'paid' as const);
            }

            // Payment not successful, check if should cancel
            return this.checkAndCancelIfTimeout(order);
          })
          .orElse((error) => {
            // VNPay API error, check if should cancel based on timeout
            this.logger.warn(
              `VNPay query failed for order ${order.id}: ${error.message}, checking timeout`,
            );
            return this.checkAndCancelIfTimeout(order);
          });
      })
      .mapErr((error) => new Error(error.message));
  }

  /**
   * Check if order has exceeded timeout and cancel if so
   */
  private checkAndCancelIfTimeout(
    order: Order,
  ): ResultAsync<'cancelled' | 'pending', never> {
    const orderAgeMinutes =
      (Date.now() - order.createdAt.getTime()) / (1000 * 60);

    if (orderAgeMinutes >= ORDER_PAYMENT_TIMEOUT_MINUTES) {
      this.logger.log(
        `Order ${order.id} exceeded timeout (${orderAgeMinutes.toFixed(1)} mins), cancelling`,
      );
      return this.orderService
        .cancelOrderDueToPaymentTimeout(order.id)
        .map(() => 'cancelled' as const)
        .orElse(() => okAsync('pending' as const));
    }

    this.logger.debug(
      `Order ${order.id} not yet timed out (${orderAgeMinutes.toFixed(1)}/${ORDER_PAYMENT_TIMEOUT_MINUTES} mins)`,
    );
    return okAsync('pending' as const);
  }
}

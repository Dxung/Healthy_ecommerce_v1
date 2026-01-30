/**
 * Order-related constants
 */

/** Days after delivery to auto-complete order if buyer doesn't confirm */
export const ORDER_AUTO_COMPLETE_DAYS = 3;

/**
 * Maximum time (in minutes) allowed for payment before order is auto-cancelled.
 * Default: 30 minutes. Can be overridden by env var ORDER_PAYMENT_TIMEOUT_MINUTES.
 */
export const ORDER_PAYMENT_TIMEOUT_MINUTES = parseInt(
  process.env.ORDER_PAYMENT_TIMEOUT_MINUTES || '30',
  10,
);

/**
 * Time (in minutes) before timeout to start checking VNPay for payment status.
 * Default: Half of the timeout period.
 */
export const ORDER_PAYMENT_CHECK_THRESHOLD_MINUTES =
  ORDER_PAYMENT_TIMEOUT_MINUTES / 2;

/**
 * Maximum number of orders to process per cron job run.
 * Default: 500. Can be overridden by env var ORDER_PAYMENT_CHECK_BATCH_LIMIT.
 */
export const ORDER_PAYMENT_CHECK_BATCH_LIMIT = parseInt(
  process.env.ORDER_PAYMENT_CHECK_BATCH_LIMIT || '500',
  10,
);

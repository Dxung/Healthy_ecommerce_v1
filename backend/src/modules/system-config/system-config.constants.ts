/**
 * System configuration keys
 */
export const CONFIG_KEYS = {
  PLATFORM_FEE_PERCENT: 'platform_fee_percent',
  REVIEW_WINDOW_DAYS: 'review_window_days',
  COIN_EARN_RATE_PERCENT: 'coin_earn_rate_percent',
  COIN_MAX_USAGE_PERCENT: 'coin_max_usage_percent',
  DEFAULT_MAX_PRODUCT_SLOTS: 'default_max_product_slots',
  SHIPPING_FREE_THRESHOLD: 'shipping_free_threshold',
  ORDER_AUTO_COMPLETE_DAYS: 'order_auto_complete_days',
} as const;

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG = {
  [CONFIG_KEYS.PLATFORM_FEE_PERCENT]: 5, // 5% default platform fee
  [CONFIG_KEYS.REVIEW_WINDOW_DAYS]: 30, // 30 days to review after order completion
  [CONFIG_KEYS.COIN_EARN_RATE_PERCENT]: 1, // 1% of order value converted to coins
  [CONFIG_KEYS.COIN_MAX_USAGE_PERCENT]: 50, // Max 50% of order can be paid with coins
  [CONFIG_KEYS.DEFAULT_MAX_PRODUCT_SLOTS]: 50, // Max 50 products for shops without badge
  [CONFIG_KEYS.SHIPPING_FREE_THRESHOLD]: 500000, // 500,000 VND threshold for free shipping
  [CONFIG_KEYS.ORDER_AUTO_COMPLETE_DAYS]: 3, // 3 days after delivery to auto-complete order
} as const;

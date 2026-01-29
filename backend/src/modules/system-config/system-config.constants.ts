/**
 * System configuration keys
 */
export const CONFIG_KEYS = {
  PLATFORM_FEE_PERCENT: 'platform_fee_percent',
  REVIEW_WINDOW_DAYS: 'review_window_days',
} as const;

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG = {
  [CONFIG_KEYS.PLATFORM_FEE_PERCENT]: 5, // 5% default platform fee
  [CONFIG_KEYS.REVIEW_WINDOW_DAYS]: 30, // 30 days to review after order completion
} as const;

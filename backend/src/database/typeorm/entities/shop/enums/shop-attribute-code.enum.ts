/**
 * Shop attribute codes for attribute-based badge requirements.
 * Maps to shop_schema.shop_attribute_code_enum in PostgreSQL.
 */
export enum ShopAttributeCode {
  /** Average customer rating (0-5 scale) */
  AVERAGE_RATING = 'average_rating',

  /** Percentage of successfully completed orders */
  ORDER_SUCCESS_RATE = 'order_success_rate',

  /** Total number of orders in last 30 days */
  TOTAL_ORDERS_30D = 'total_orders_30d',

  /** Average response time in hours */
  RESPONSE_TIME_HOURS = 'response_time_hours',

  /** Percentage of returned orders */
  RETURN_RATE = 'return_rate',

  /** Penalty points accumulated */
  PENALTY_POINTS = 'penalty_points',

  /** Current penalty tier */
  PENALTY_TIER = 'penalty_tier',
}

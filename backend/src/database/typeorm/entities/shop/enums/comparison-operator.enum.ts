/**
 * Comparison operators for attribute-based badge requirements.
 * Maps to shop_schema.comparison_operator_enum in PostgreSQL.
 */
export enum ComparisonOperator {
  /** Greater than */
  GT = 'gt',

  /** Greater than or equal */
  GTE = 'gte',

  /** Less than */
  LT = 'lt',

  /** Less than or equal */
  LTE = 'lte',

  /** Equal */
  EQ = 'eq',
}

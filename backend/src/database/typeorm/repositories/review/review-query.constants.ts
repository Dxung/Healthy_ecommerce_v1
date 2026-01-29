/**
 * Query constants for Review repository.
 * Using constants prevents SQL injection and makes queries more maintainable.
 */

// Table aliases
export const REVIEW_ALIAS = 'review';
export const REVIEW_IMAGE_ALIAS = 'reviewImage';
export const REVIEW_REPLY_ALIAS = 'reviewReply';
export const USER_ALIAS = 'user';

// Column references
export const ReviewColumn = {
  ID: `${REVIEW_ALIAS}.id`,
  ORDER_ITEM_ID: `${REVIEW_ALIAS}.order_item_id`,
  USER_ID: `${REVIEW_ALIAS}.user_id`,
  PRODUCT_ID: `${REVIEW_ALIAS}.product_id`,
  SHOP_ID: `${REVIEW_ALIAS}.shop_id`,
  RATING: `${REVIEW_ALIAS}.rating`,
  CONTENT: `${REVIEW_ALIAS}.content`,
  STATUS: `${REVIEW_ALIAS}.status`,
  DELETED_AT: `${REVIEW_ALIAS}.deleted_at`,
  CREATED_AT: `${REVIEW_ALIAS}.created_at`,
  UPDATED_AT: `${REVIEW_ALIAS}.updated_at`,
} as const;

// Query parameter names
export const QueryParam = {
  ID: 'id',
  ORDER_ITEM_ID: 'orderItemId',
  USER_ID: 'userId',
  PRODUCT_ID: 'productId',
  SHOP_ID: 'shopId',
  STATUS: 'status',
  ACTIVE_STATUS: 'activeStatus',
} as const;

// Relation names
export const ReviewRelation = {
  IMAGES: 'images',
  REPLY: 'reply',
  USER: 'user',
  PRODUCT: 'product',
  SHOP: 'shop',
  ORDER_ITEM: 'orderItem',
} as const;

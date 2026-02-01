/**
 * Query constants for Review repository.
 * Using constants prevents SQL injection and makes queries more maintainable.
 */

// Table aliases
export const REVIEW_ALIAS = 'review';
export const REVIEW_IMAGE_ALIAS = 'reviewImage';
export const REVIEW_REPLY_ALIAS = 'reviewReply';
export const USER_ALIAS = 'user';

// Column references (use entity property names, not database column names)
export const ReviewColumn = {
  ID: `${REVIEW_ALIAS}.id`,
  ORDER_ITEM_ID: `${REVIEW_ALIAS}.orderItemId`,
  USER_ID: `${REVIEW_ALIAS}.userId`,
  PRODUCT_ID: `${REVIEW_ALIAS}.productId`,
  SHOP_ID: `${REVIEW_ALIAS}.shopId`,
  RATING: `${REVIEW_ALIAS}.rating`,
  CONTENT: `${REVIEW_ALIAS}.content`,
  STATUS: `${REVIEW_ALIAS}.status`,
  DELETED_AT: `${REVIEW_ALIAS}.deletedAt`,
  CREATED_AT: `${REVIEW_ALIAS}.createdAt`,
  UPDATED_AT: `${REVIEW_ALIAS}.updatedAt`,
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

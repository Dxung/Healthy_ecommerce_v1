/**
 * Query constants for Product-related TypeORM queries.
 * Using constants prevents typos and makes refactoring easier.
 */

// ======================== TABLE ALIASES ========================

export const PRODUCT_ALIAS = 'product';
export const IMAGE_ALIAS = 'images';
export const OPTION_ALIAS = 'options';
export const OPTION_VALUE_ALIAS = 'values';
export const VARIANT_ALIAS = 'variants';
export const VARIANT_OPTION_ALIAS = 'optionValues';

// ======================== PRODUCT COLUMNS ========================

export const ProductColumn = {
  ID: `${PRODUCT_ALIAS}.id`,
  SHOP_ID: `${PRODUCT_ALIAS}.shopId`,
  CATEGORY_ID: `${PRODUCT_ALIAS}.categoryId`,
  BRAND_ID: `${PRODUCT_ALIAS}.brandId`,
  NAME: `${PRODUCT_ALIAS}.name`,
  SLUG: `${PRODUCT_ALIAS}.slug`,
  STATUS: `${PRODUCT_ALIAS}.status`,
  IS_VISIBLE: `${PRODUCT_ALIAS}.isVisible`,
  MIN_PRICE: `${PRODUCT_ALIAS}.minPrice`,
  MAX_PRICE: `${PRODUCT_ALIAS}.maxPrice`,
  TOTAL_SOLD: `${PRODUCT_ALIAS}.totalSold`,
  AVERAGE_RATING: `${PRODUCT_ALIAS}.averageRating`,
  CREATED_AT: `${PRODUCT_ALIAS}.createdAt`,
  DELETED_AT: `${PRODUCT_ALIAS}.deletedAt`,
} as const;

// ======================== IMAGE COLUMNS ========================

export const ImageColumn = {
  ID: `${IMAGE_ALIAS}.id`,
  PRODUCT_ID: `${IMAGE_ALIAS}.productId`,
  SORT_ORDER: `${IMAGE_ALIAS}.sortOrder`,
} as const;

// ======================== OPTION COLUMNS ========================

export const OptionColumn = {
  ID: `${OPTION_ALIAS}.id`,
  PRODUCT_ID: `${OPTION_ALIAS}.productId`,
  SORT_ORDER: `${OPTION_ALIAS}.sortOrder`,
} as const;

// ======================== VARIANT COLUMNS ========================

export const VariantColumn = {
  ID: `${VARIANT_ALIAS}.id`,
  PRODUCT_ID: `${VARIANT_ALIAS}.productId`,
  IS_ACTIVE: `${VARIANT_ALIAS}.isActive`,
  DELETED_AT: `${VARIANT_ALIAS}.deletedAt`,
  CREATED_AT: `${VARIANT_ALIAS}.createdAt`,
} as const;

// ======================== QUERY PARAMETERS ========================

export const QueryParam = {
  ID: 'id',
  SHOP_ID: 'shopId',
  PRODUCT_ID: 'productId',
  CATEGORY_ID: 'categoryId',
  BRAND_ID: 'brandId',
  STATUS: 'status',
  IS_VISIBLE: 'isVisible',
  SLUG: 'slug',
  SEARCH: 'search',
  MIN_PRICE: 'minPrice',
  MAX_PRICE: 'maxPrice',
  EXCLUDE_ID: 'excludeId',
  VARIANT_ID: 'variantId',
  IMAGE_ID: 'imageId',
  OPTION_IDS: 'ids',
  DIET_TAG_IDS: 'dietTagIds',
  ALLERGEN_FREE_IDS: 'allergenFreeIds',
  DIET_TAG_COUNT: 'dietTagCount',
} as const;

// ======================== RELATION PATHS ========================

export const ProductRelation = {
  IMAGES: 'images',
  OPTIONS: 'options',
  OPTIONS_VALUES: 'options.values',
  VARIANTS: 'variants',
  VARIANTS_OPTION_VALUES: 'variants.optionValues',
  SERVING_UNIT: 'servingUnit',
  VARIANTS_SELLING_UNIT: 'variants.sellingUnit',
} as const;

export const SHARED_ERRORS = {
  DB_ERROR: {
    code: 'SHARED_DB_ERROR',
    message: 'A database error occurred in the module.',
  },
  ENCODE_ERROR: {
    code: 'SHARED_ENCODE_ERROR',
    message: 'An error occurred during encoding process.',
  },
  ALS_STORE_NOT_FOUND: {
    code: 'SHARED_ALS_STORE_NOT_FOUND',
    message: 'Async Local Storage store not found.',
  },
  CACHE_SERVICE_UNAVAILABLE: {
    code: 'SHARED_CACHE_SERVICE_UNAVAILABLE',
    message: 'The cache service is currently unavailable.',
  },
  SYSTEM_ERROR: {
    code: 'SHARED_SYSTEM_ERROR',
    message: 'An internal system error occurred.',
  },
  TOO_MANY_REQUESTS: {
    code: 'SHARED_TOO_MANY_REQUESTS',
    message: 'Too many requests have been made in a short period.',
  },
} as const satisfies Record<string, { code: string; message: string }>;

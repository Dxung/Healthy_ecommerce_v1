/**
 * Pagination query parameters.
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * Paginated result containing items and metadata.
 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Creates a paginated result object.
 */
export function createPaginatedResult<T>(
  items: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

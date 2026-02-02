import type { ResultAsync } from 'neverthrow';
import type { DomainError } from 'src/shared/types/domain-error.type';
import type { Shop } from './models/shop.model';
import type { ShopStatus } from 'src/database/typeorm/entities/shop/enums/shop-status.enum';
import type {
  PaginatedResult,
  PaginationParams,
} from 'src/shared/types/pagination.type';

export interface AdminShopFilters {
  status?: ShopStatus;
  search?: string;
  isAdminSuspended?: boolean;
}

export interface IAdminShopService {
  /**
   * Gets all shops with pagination and filters.
   * For admin use only.
   * @param filters - Optional filters (status, search, isAdminSuspended)
   * @param pagination - Pagination parameters
   * @returns A paginated list of shops.
   */
  getAllShops(
    filters: AdminShopFilters,
    pagination: PaginationParams,
  ): ResultAsync<PaginatedResult<Shop>, DomainError>;

  /**
   * Gets a shop by ID with full details.
   * For admin use only.
   * @param id - The shop ID
   * @returns The shop with location names or DomainError if not found.
   */
  getShopById(id: string): ResultAsync<Shop, DomainError>;

  /**
   * Suspends a shop (admin action).
   * Sets isAdminSuspended to true with reason.
   * Requires AuthGuard to set adminId in ALS.
   * @param id - The shop ID to suspend
   * @param reason - The suspension reason
   * @returns void on success or DomainError.
   */
  suspendShop(id: string, reason: string): ResultAsync<void, DomainError>;

  /**
   * Unsuspends a shop (admin action).
   * Sets isAdminSuspended to false.
   * Requires AuthGuard to set adminId in ALS.
   * @param id - The shop ID to unsuspend
   * @returns void on success or DomainError.
   */
  unsuspendShop(id: string): ResultAsync<void, DomainError>;

  /**
   * Bans a shop permanently (admin action).
   * Sets status to 'banned'.
   * Requires AuthGuard to set adminId in ALS.
   * @param id - The shop ID to ban
   * @param reason - The ban reason
   * @returns void on success or DomainError.
   */
  banShop(id: string, reason: string): ResultAsync<void, DomainError>;
}

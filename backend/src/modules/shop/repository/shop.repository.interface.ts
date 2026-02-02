import type { ResultAsync } from 'neverthrow';
import type { DomainError } from 'src/shared/types/domain-error.type';
import type { Shop } from '../models/shop.model';
import type { ShopBadgeAssignment } from '../models/shop-badge-assignment.model';
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

/**
 * Repository interface for Shop entity operations.
 * All methods return ResultAsync for consistent error handling.
 */
export interface IShopRepository {
  /**
   * Creates a new shop in the database.
   * @param shop - The shop domain model to create
   * @returns The created shop with populated fields
   *
   * Errors:
   * - DB_ERROR for database failures
   * - SLUG_ALREADY_EXISTS if slug is taken
   * - ALREADY_HAS_SHOP if user already owns a shop
   */
  create(shop: Shop): ResultAsync<Shop, DomainError>;

  /**
   * Finds a shop by its ID.
   * @param id - The shop ID
   * @returns The shop if found, null otherwise
   */
  findById(id: string): ResultAsync<Shop | null, DomainError>;

  /**
   * Finds a shop by user ID (owner).
   * @param userId - The user ID
   * @returns The shop if found, null otherwise
   */
  findByUserId(userId: string): ResultAsync<Shop | null, DomainError>;

  /**
   * Finds a shop by slug.
   * @param slug - The shop slug
   * @returns The shop if found, null otherwise
   */
  findBySlug(slug: string): ResultAsync<Shop | null, DomainError>;

  /**
   * Checks if a slug already exists in the shops table.
   * @param slug - The slug to check
   * @returns true if exists, false otherwise
   */
  existsBySlug(slug: string): ResultAsync<boolean, DomainError>;

  /**
   * Checks if a user already owns a shop.
   * @param userId - The user ID to check
   * @returns true if user has a shop, false otherwise
   */
  existsByUserId(userId: string): ResultAsync<boolean, DomainError>;

  /**
   * Updates an existing shop.
   * @param shop - The shop domain model with updated data
   * @returns The updated shop
   *
   * Errors:
   * - DB_ERROR for database failures
   * - SHOP_NOT_FOUND if shop doesn't exist
   */
  update(shop: Shop): ResultAsync<Shop, DomainError>;

  /**
   * Creates a new badge assignment for a shop.
   * @param badge - The badge assignment domain model to create
   * @returns The created badge assignment
   *
   * Errors:
   * - DB_ERROR for database failures
   * - BADGE_ALREADY_EXISTS if shop already has this badge type
   */
  createBadgeAssignment(
    badge: ShopBadgeAssignment,
  ): ResultAsync<ShopBadgeAssignment, DomainError>;

  // ======================== ADMIN OPERATIONS ========================

  /**
   * Finds all shops with pagination and filters.
   * @param filters - Filter options (status, search, isAdminSuspended)
   * @param pagination - Pagination options
   * @returns Paginated result of shops
   */
  findAll(
    filters: AdminShopFilters,
    pagination: PaginationParams,
  ): ResultAsync<PaginatedResult<Shop>, DomainError>;

  /**
   * Updates shop admin suspension status.
   * @param id - The shop ID
   * @param isAdminSuspended - Whether the shop is suspended
   * @param reason - The suspension reason (required if suspending)
   * @param adminId - The admin who made the change
   * @returns The updated shop
   */
  updateAdminSuspension(
    id: string,
    isAdminSuspended: boolean,
    reason: string | null,
    adminId: string,
  ): ResultAsync<Shop, DomainError>;

  /**
   * Updates shop status to banned.
   * @param id - The shop ID
   * @param reason - The ban reason
   * @param adminId - The admin who made the change
   * @returns The updated shop
   */
  banShop(
    id: string,
    reason: string,
    adminId: string,
  ): ResultAsync<Shop, DomainError>;

  /**
   * Updates the average rating and total ratings for a shop.
   * @param shopId - The shop ID.
   * @param averageRating - The new average rating.
   * @param totalRatings - The new total count of ratings.
   * @returns void on success.
   */
  updateRating(
    shopId: string,
    averageRating: number,
    totalRatings: number,
  ): ResultAsync<void, DomainError>;
}

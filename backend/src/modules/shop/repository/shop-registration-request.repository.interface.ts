import type { ResultAsync } from 'neverthrow';
import type { ShopRegistrationRequest } from '../models/shop-registration-request.model';
import type { DomainError } from 'src/shared/types/domain-error.type';
import type { ShopRegistrationStatus } from 'src/database/typeorm/entities/shop/enums/shop-registration-status.enum';

export interface IShopRegistrationRequestRepository {
  /**
   * Creates a new shop registration request with its documents.
   * @param request - The ShopRegistrationRequest domain model
   * @returns The created ShopRegistrationRequest or DomainError on failure
   */
  create(
    request: ShopRegistrationRequest,
  ): ResultAsync<ShopRegistrationRequest, DomainError>;

  /**
   * Finds a registration request by its ID.
   * @param id - The registration request ID
   * @returns The ShopRegistrationRequest or null if not found, DomainError on failure
   */
  findById(
    id: string,
  ): ResultAsync<ShopRegistrationRequest | null, DomainError>;

  /**
   * Finds a registration request by user ID (any status).
   * @param userId - The user ID
   * @returns The ShopRegistrationRequest or null if not found, DomainError on failure
   */
  findByUserId(
    userId: string,
  ): ResultAsync<ShopRegistrationRequest | null, DomainError>;

  /**
   * Finds a pending registration request by user ID.
   * @param userId - The user ID
   * @returns The pending ShopRegistrationRequest or null if not found, DomainError on failure
   */
  findPendingByUserId(
    userId: string,
  ): ResultAsync<ShopRegistrationRequest | null, DomainError>;

  /**
   * Finds all registration requests by status.
   * @param status - The status to filter by
   * @returns Array of ShopRegistrationRequest or DomainError on failure
   */
  findAllByStatus(
    status: ShopRegistrationStatus,
  ): ResultAsync<ShopRegistrationRequest[], DomainError>;

  /**
   * Finds all registration requests (for admin listing).
   * @returns Array of ShopRegistrationRequest or DomainError on failure
   */
  findAll(): ResultAsync<ShopRegistrationRequest[], DomainError>;

  /**
   * Updates an existing registration request.
   * @param request - The ShopRegistrationRequest domain model with updated fields
   * @returns The updated ShopRegistrationRequest or DomainError on failure
   */
  update(
    request: ShopRegistrationRequest,
  ): ResultAsync<ShopRegistrationRequest, DomainError>;

  /**
   * Checks if a slug already exists in registrations or shops.
   * @param slug - The slug to check
   * @returns True if slug exists, false otherwise, DomainError on failure
   */
  isSlugExists(slug: string): ResultAsync<boolean, DomainError>;

  /**
   * Checks if a shop name already exists in registrations or shops.
   * @param name - The name to check
   * @returns True if name exists, false otherwise, DomainError on failure
   */
  isNameExists(name: string): ResultAsync<boolean, DomainError>;

  /**
   * Checks if a slug exists in non-rejected registrations (pending/approved).
   * Used in 2-phase registration to validate shop name availability.
   * @param slug - The slug to check
   * @returns True if slug exists in non-rejected registrations, false otherwise
   */
  existsBySlugExcludingRejected(
    slug: string,
  ): ResultAsync<boolean, DomainError>;
}

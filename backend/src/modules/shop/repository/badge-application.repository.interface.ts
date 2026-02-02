import type { ResultAsync } from 'neverthrow';
import type { DomainError } from 'src/shared/types/domain-error.type';
import type { BadgeApplication } from '../models/badge-application.model';
import type { BadgeApplicationStatus } from 'src/database/typeorm/entities/shop/enums/badge-application-status.enum';
import type { BadgeApplicationType } from 'src/database/typeorm/entities/shop/enums/badge-application-type.enum';
import type {
  PaginatedResult,
  PaginationParams,
} from 'src/shared/types/pagination.type';

export interface BadgeApplicationFilters {
  status?: BadgeApplicationStatus;
  applicationType?: BadgeApplicationType;
  shopId?: string;
}

/**
 * Repository interface for BadgeApplication entity operations.
 */
export interface IBadgeApplicationRepository {
  /**
   * Creates a new badge application with documents.
   */
  create(
    application: BadgeApplication,
  ): ResultAsync<BadgeApplication, DomainError>;

  /**
   * Finds an application by ID.
   */
  findById(id: string): ResultAsync<BadgeApplication | null, DomainError>;

  /**
   * Finds all applications by shop ID.
   */
  findByShopId(shopId: string): ResultAsync<BadgeApplication[], DomainError>;

  /**
   * Finds pending Verified application by shop ID.
   */
  findPendingVerifiedByShop(
    shopId: string,
  ): ResultAsync<BadgeApplication | null, DomainError>;

  /**
   * Finds pending Official application by shop and brand.
   */
  findPendingOfficialByShopAndBrand(
    shopId: string,
    brandId: string,
  ): ResultAsync<BadgeApplication | null, DomainError>;

  /**
   * Updates an application.
   */
  update(
    application: BadgeApplication,
  ): ResultAsync<BadgeApplication, DomainError>;

  /**
   * Finds all applications with pagination and filters (admin).
   */
  findAll(
    filters: BadgeApplicationFilters,
    pagination: PaginationParams,
  ): ResultAsync<PaginatedResult<BadgeApplication>, DomainError>;
}

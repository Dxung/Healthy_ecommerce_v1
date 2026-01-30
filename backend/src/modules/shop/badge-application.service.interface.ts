import type { ResultAsync } from 'neverthrow';
import type { DomainError } from 'src/shared/types/domain-error.type';
import type { BadgeApplication } from './models/badge-application.model';
import type { ShopOfficialBrand } from './models/shop-official-brand.model';
import type { ShopBadgeAssignment } from './models/shop-badge-assignment.model';
import type { BrandDocumentRequirement } from './models/brand-document-requirement.model';
import type { DocumentType } from './models/document-type.model';
import type { PaginatedResult, PaginationParams } from 'src/shared/types/pagination.type';
import type { BadgeApplicationFilters } from './repository/badge-application.repository.interface';
import type {
  ApplyVerifiedBadgeArgumentDto,
  ApplyOfficialBadgeArgumentDto,
  AddBrandRequirementArgumentDto,
} from './dto';

/**
 * Service interface for badge application operations.
 */
export interface IBadgeApplicationService {
  //================================================== SHOP OWNER OPERATIONS ==================================================

  /**
   * Gets document requirements for Verified badge.
   */
  getVerifiedRequirements(): ResultAsync<DocumentType[], DomainError>;

  /**
   * Gets document requirements for Official badge for a specific brand.
   */
  getOfficialRequirements(brandId: string): ResultAsync<BrandDocumentRequirement[], DomainError>;

  /**
   * Applies for Verified badge.
   * Creates a pending badge application with submitted documents.
   */
  applyForVerifiedBadge(dto: ApplyVerifiedBadgeArgumentDto): ResultAsync<BadgeApplication, DomainError>;

  /**
   * Applies for Official badge for a specific brand.
   * Creates a pending badge application with submitted documents.
   */
  applyForOfficialBadge(dto: ApplyOfficialBadgeArgumentDto): ResultAsync<BadgeApplication, DomainError>;

  /**
   * Cancels a pending badge application.
   * Only the shop owner can cancel their own pending applications.
   */
  cancelApplication(applicationId: string): ResultAsync<BadgeApplication, DomainError>;

  /**
   * Gets all badge applications for the current shop.
   */
  getMyApplications(): ResultAsync<BadgeApplication[], DomainError>;

  /**
   * Gets the current shop's badges.
   */
  getMyBadges(): ResultAsync<ShopBadgeAssignment[], DomainError>;

  /**
   * Gets the current shop's official brands.
   */
  getMyOfficialBrands(): ResultAsync<ShopOfficialBrand[], DomainError>;

  //================================================== ADMIN OPERATIONS ==================================================

  /**
   * Gets all badge applications with filters and pagination.
   */
  getAllApplications(
    filters: BadgeApplicationFilters,
    pagination: PaginationParams,
  ): ResultAsync<PaginatedResult<BadgeApplication>, DomainError>;

  /**
   * Gets a badge application by ID.
   */
  getApplicationById(applicationId: string): ResultAsync<BadgeApplication, DomainError>;

  /**
   * Approves a badge application.
   * Creates badge assignment and/or shop_official_brands record.
   */
  approveApplication(applicationId: string): ResultAsync<BadgeApplication, DomainError>;

  /**
   * Rejects a badge application.
   */
  rejectApplication(applicationId: string, reason: string): ResultAsync<BadgeApplication, DomainError>;

  /**
   * Gets document requirements for a brand (admin view).
   */
  getBrandDocumentRequirements(brandId: string): ResultAsync<BrandDocumentRequirement[], DomainError>;

  /**
   * Adds a document requirement to a brand.
   */
  addBrandDocumentRequirement(
    brandId: string,
    dto: AddBrandRequirementArgumentDto,
  ): ResultAsync<BrandDocumentRequirement, DomainError>;

  /**
   * Removes a document requirement from a brand.
   */
  removeBrandDocumentRequirement(requirementId: string): ResultAsync<void, DomainError>;
}

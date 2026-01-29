import type { ResultAsync } from 'neverthrow';
import type { DomainError } from 'src/shared/types/domain-error.type';
import type { ShopBadge } from './models/shop-badge.model';
import type { DocumentType } from './models/document-type.model';
import type { BadgeRequirement } from './models/badge-requirement.model';
import type { ShopBadgeCode } from 'src/database/typeorm/entities/shop/enums/shop-badge-code.enum';
import type {
  CreateDocumentTypeArgumentDto,
  UpdateDocumentTypeArgumentDto,
  AddRequirementArgumentDto,
} from './dto';

/**
 * Service interface for admin badge management.
 */
export interface IAdminBadgeService {
  // ======================== BADGE OPERATIONS ========================

  /**
   * Gets all badges with their requirement counts.
   */
  getAllBadges(): ResultAsync<ShopBadge[], DomainError>;

  /**
   * Gets a badge by code with full details including requirements.
   */
  getBadgeByCode(code: ShopBadgeCode): ResultAsync<ShopBadge, DomainError>;

  /**
   * Toggles a badge's active status.
   */
  toggleBadgeActive(code: ShopBadgeCode): ResultAsync<ShopBadge, DomainError>;

  // ======================== DOCUMENT TYPE OPERATIONS ========================

  /**
   * Gets all document types.
   */
  getAllDocumentTypes(): ResultAsync<DocumentType[], DomainError>;

  /**
   * Gets all document types with their applied badge names.
   */
  getAllDocumentTypesWithAppliedBadges(): ResultAsync<
    { documentType: DocumentType; appliedBadges: string[] }[],
    DomainError
  >;

  /**
   * Creates a new document type.
   */
  createDocumentType(
    dto: CreateDocumentTypeArgumentDto,
  ): ResultAsync<DocumentType, DomainError>;

  /**
   * Updates a document type.
   */
  updateDocumentType(
    id: string,
    dto: UpdateDocumentTypeArgumentDto,
  ): ResultAsync<DocumentType, DomainError>;

  /**
   * Deletes a document type (soft delete).
   */
  deleteDocumentType(id: string): ResultAsync<void, DomainError>;

  // ======================== REQUIREMENT OPERATIONS ========================

  /**
   * Adds a requirement to a badge.
   */
  addRequirement(
    badgeCode: ShopBadgeCode,
    dto: AddRequirementArgumentDto,
  ): ResultAsync<BadgeRequirement, DomainError>;

  /**
   * Removes a requirement from a badge.
   */
  removeRequirement(requirementId: string): ResultAsync<void, DomainError>;

  /**
   * Toggles a requirement's active status.
   */
  toggleRequirementActive(
    requirementId: string,
  ): ResultAsync<BadgeRequirement, DomainError>;
}

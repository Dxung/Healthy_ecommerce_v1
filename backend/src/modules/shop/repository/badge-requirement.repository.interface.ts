import type { ResultAsync } from 'neverthrow';
import type { DomainError } from 'src/shared/types/domain-error.type';
import type { BadgeRequirement } from '../models/badge-requirement.model';
import type { ShopBadgeCode } from 'src/database/typeorm/entities/shop/enums/shop-badge-code.enum';

/**
 * Repository interface for BadgeRequirement entity operations.
 */
export interface IBadgeRequirementRepository {
  /**
   * Creates a new badge requirement.
   * @param requirement - The requirement to create
   * @returns The created requirement
   */
  create(requirement: BadgeRequirement): ResultAsync<BadgeRequirement, DomainError>;

  /**
   * Gets all requirements for a badge.
   * @param badgeCode - The badge code
   * @param includeDocumentType - Whether to include documentType relation
   * @returns All requirements for the badge
   */
  findByBadgeCode(
    badgeCode: ShopBadgeCode,
    includeDocumentType?: boolean,
  ): ResultAsync<BadgeRequirement[], DomainError>;

  /**
   * Gets all active requirements for a badge.
   * @param badgeCode - The badge code
   * @param includeDocumentType - Whether to include documentType relation
   * @returns Active requirements for the badge
   */
  findActiveByBadgeCode(
    badgeCode: ShopBadgeCode,
    includeDocumentType?: boolean,
  ): ResultAsync<BadgeRequirement[], DomainError>;

  /**
   * Finds a requirement by ID.
   * @param id - The requirement ID
   * @param includeDocumentType - Whether to include documentType relation
   * @returns The requirement if found, null otherwise
   */
  findById(
    id: string,
    includeDocumentType?: boolean,
  ): ResultAsync<BadgeRequirement | null, DomainError>;

  /**
   * Updates a requirement.
   * @param requirement - The requirement with updated data
   * @returns The updated requirement
   */
  update(requirement: BadgeRequirement): ResultAsync<BadgeRequirement, DomainError>;

  /**
   * Deletes a requirement.
   * @param id - The requirement ID
   * @returns void
   */
  delete(id: string): ResultAsync<void, DomainError>;
}

import type { ResultAsync } from 'neverthrow';
import type { DomainError } from 'src/shared/types/domain-error.type';
import type { BrandDocumentRequirement } from '../models/brand-document-requirement.model';

/**
 * Repository interface for BrandDocumentRequirement entity operations.
 */
export interface IBrandDocumentRequirementRepository {
  /**
   * Creates a new brand document requirement.
   */
  create(
    requirement: BrandDocumentRequirement,
  ): ResultAsync<BrandDocumentRequirement, DomainError>;

  /**
   * Finds by ID.
   */
  findById(
    id: string,
  ): ResultAsync<BrandDocumentRequirement | null, DomainError>;

  /**
   * Finds all active requirements for a brand.
   */
  findActiveByBrand(
    brandId: string,
  ): ResultAsync<BrandDocumentRequirement[], DomainError>;

  /**
   * Finds all requirements for a brand (including inactive).
   */
  findAllByBrand(
    brandId: string,
  ): ResultAsync<BrandDocumentRequirement[], DomainError>;

  /**
   * Checks if requirement exists for brand and document type.
   */
  existsByBrandAndDocumentType(
    brandId: string,
    documentTypeId: string,
  ): ResultAsync<boolean, DomainError>;

  /**
   * Updates a requirement.
   */
  update(
    requirement: BrandDocumentRequirement,
  ): ResultAsync<BrandDocumentRequirement, DomainError>;

  /**
   * Deletes a requirement.
   */
  delete(id: string): ResultAsync<void, DomainError>;
}

import type { ResultAsync } from 'neverthrow';
import type { DomainError } from 'src/shared/types/domain-error.type';
import type { DocumentType } from '../models/document-type.model';

/**
 * Repository interface for DocumentType entity operations.
 */
export interface IDocumentTypeRepository {
  /**
   * Creates a new document type.
   * @param documentType - The document type to create
   * @returns The created document type
   */
  create(documentType: DocumentType): ResultAsync<DocumentType, DomainError>;

  /**
   * Gets all document types (including inactive ones).
   * @returns All document types
   */
  findAll(): ResultAsync<DocumentType[], DomainError>;

  /**
   * Gets all active document types.
   * @returns Active document types only
   */
  findAllActive(): ResultAsync<DocumentType[], DomainError>;

  /**
   * Finds a document type by ID.
   * @param id - The document type ID
   * @returns The document type if found, null otherwise
   */
  findById(id: string): ResultAsync<DocumentType | null, DomainError>;

  /**
   * Updates a document type.
   * @param documentType - The document type with updated data
   * @returns The updated document type
   */
  update(documentType: DocumentType): ResultAsync<DocumentType, DomainError>;

  /**
   * Deletes a document type (soft delete via is_active = false).
   * @param id - The document type ID
   * @returns void
   */
  delete(id: string): ResultAsync<void, DomainError>;

  /**
   * Gets all document types with their applied badge names.
   * @returns Document types with badge names that require them
   */
  findAllWithAppliedBadges(): ResultAsync<
    { documentType: DocumentType; appliedBadges: string[] }[],
    DomainError
  >;
}

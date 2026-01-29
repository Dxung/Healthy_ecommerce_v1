import type { ResultAsync } from 'neverthrow';
import type { DomainError } from 'src/shared/types/domain-error.type';

/**
 * Interface for Unit of Work pattern
 */
export interface IUow {
  executeInTransaction<T>(
    work: () => ResultAsync<T, DomainError>,
  ): ResultAsync<T, DomainError>;
}

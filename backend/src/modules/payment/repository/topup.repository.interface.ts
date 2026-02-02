import type { ResultAsync } from 'neverthrow';
import type { DomainError } from 'src/shared/types/domain-error.type';
import type { Topup } from '../models/topup.model';

export interface ITopupRepository {
  /**
   * Create a new topup request
   */
  create(topup: Topup): ResultAsync<Topup, DomainError>;

  /**
   * Find topup by ID
   */
  findById(id: string): ResultAsync<Topup | null, DomainError>;

  /**
   * Find topup by ID with pessimistic lock for update.
   * Must be called within a transaction.
   * Used to prevent race conditions during reconciliation.
   */
  findByIdWithLock(id: string): ResultAsync<Topup | null, DomainError>;

  /**
   * Update topup
   */
  update(topup: Topup): ResultAsync<Topup, DomainError>;

  /**
   * Save topup (alias for update)
   */
  save(topup: Topup): ResultAsync<Topup, DomainError>;

  /**
   * Find processing topups that need reconciliation.
   * Returns topups with status=PROCESSING created more than X minutes ago
   * but less than 48 hours ago (VNPay data retention limit).
   * @param minutesSinceCreation - Minimum age in minutes (e.g., 10)
   * @param limit - Maximum number of records to return
   */
  findProcessingTopupsForReconcile(
    minutesSinceCreation: number,
    limit?: number,
  ): ResultAsync<Topup[], DomainError>;

  /**
   * Find topups by wallet ID with pagination
   */
  findByWalletId(
    walletId: string,
    options: { page: number; limit: number },
  ): ResultAsync<
    { items: Topup[]; total: number; page: number; limit: number },
    DomainError
  >;
}

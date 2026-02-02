import type { ResultAsync } from 'neverthrow';
import type { DomainError } from 'src/shared/types/domain-error.type';
import type { EscrowHold } from '../models/escrow-hold.model';
import type { PendingRelease } from '../models/pending-release.model';

export interface IEscrowRepository {
  /**
   * Create a new escrow hold
   */
  createHold(escrowHold: EscrowHold): ResultAsync<EscrowHold, DomainError>;

  /**
   * Find escrow hold by ID
   */
  findById(id: string): ResultAsync<EscrowHold | null, DomainError>;

  /**
   * Find escrow holds by order ID
   */
  findByOrderId(orderId: string): ResultAsync<EscrowHold[], DomainError>;

  /**
   * Update escrow hold
   */
  updateHold(escrowHold: EscrowHold): ResultAsync<EscrowHold, DomainError>;

  /**
   * Create a pending release
   */
  createPendingRelease(
    pendingRelease: PendingRelease,
  ): ResultAsync<PendingRelease, DomainError>;

  /**
   * Find pending release by ID
   */
  findPendingReleaseById(
    id: string,
  ): ResultAsync<PendingRelease | null, DomainError>;

  /**
   * Find pending releases ready for processing
   */
  findPendingReleasesForProcessing(): ResultAsync<
    PendingRelease[],
    DomainError
  >;

  /**
   * Update pending release
   */
  updatePendingRelease(
    pendingRelease: PendingRelease,
  ): ResultAsync<PendingRelease, DomainError>;

  /**
   * Find holding escrows for completed orders (for auto-release)
   */
  findHoldingEscrowsForCompletedOrders(): ResultAsync<
    Array<{ escrowHold: EscrowHold; shopId: string }>,
    DomainError
  >;
}

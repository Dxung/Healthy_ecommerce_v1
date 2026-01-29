import type { ResultAsync } from 'neverthrow';
import type { DomainError } from 'src/shared/types/domain-error.type';
import type { EscrowHold } from '../models/escrow-hold.model';
import type { PendingRelease } from '../models/pending-release.model';

export interface IEscrowService {
  createHold(
    orderId: string,
    shopId: string,
    amount: number,
  ): ResultAsync<EscrowHold, DomainError>;

  findByOrderId(orderId: string): ResultAsync<EscrowHold[], DomainError>;

  releaseToShop(escrowId: string): ResultAsync<void, DomainError>;

  refundToBuyer(
    escrowId: string,
    buyerId: string,
  ): ResultAsync<void, DomainError>;

  createPendingRelease(
    escrowHold: EscrowHold,
    shopId: string,
  ): ResultAsync<PendingRelease, DomainError>;

  processCompletedOrderReleases(): ResultAsync<number, DomainError>;

  processPendingReleasesWithRetry(): ResultAsync<number, DomainError>;

  retryFailedRelease(pendingReleaseId: string): ResultAsync<void, DomainError>;
}

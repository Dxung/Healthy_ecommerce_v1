import { ORMPendingRelease } from '../entities/payment/orm.pending-release.entity';
import { PendingRelease } from 'src/modules/payment/models/pending-release.model';

/**
 * Mapper for converting between ORM entities and domain models for PendingRelease
 */
export class ORMPendingReleaseMapper {
  /**
   * Convert ORM PendingRelease entity to PendingRelease domain model
   */
  static toDomain(ormRelease: ORMPendingRelease): PendingRelease {
    return new PendingRelease(
      ormRelease.id,
      ormRelease.escrowHoldId,
      ormRelease.shopWalletId,
      Number(ormRelease.amount),
      ormRelease.status,
      ormRelease.attempts,
      ormRelease.maxAttempts,
      ormRelease.lastError,
      ormRelease.createdAt,
      ormRelease.processedAt,
      ormRelease.nextRetryAt,
    );
  }

  /**
   * Convert PendingRelease domain model to ORM entity
   */
  static toOrm(domainRelease: PendingRelease): ORMPendingRelease {
    const ormRelease = new ORMPendingRelease();
    ormRelease.id = domainRelease.id;
    ormRelease.escrowHoldId = domainRelease.escrowHoldId;
    ormRelease.shopWalletId = domainRelease.shopWalletId;
    ormRelease.amount = domainRelease.amount;
    ormRelease.status = domainRelease.status;
    ormRelease.attempts = domainRelease.attempts;
    ormRelease.maxAttempts = domainRelease.maxAttempts;
    ormRelease.lastError = domainRelease.lastError;
    ormRelease.createdAt = domainRelease.createdAt;
    ormRelease.processedAt = domainRelease.processedAt;
    ormRelease.nextRetryAt = domainRelease.nextRetryAt;
    return ormRelease;
  }
}

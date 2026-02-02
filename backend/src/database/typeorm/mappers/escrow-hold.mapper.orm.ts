import { ORMEscrowHold } from '../entities/payment/orm.escrow-hold.entity';
import { EscrowHold } from 'src/modules/payment/models/escrow-hold.model';

/**
 * Mapper for converting between ORM entities and domain models for EscrowHold
 */
export class ORMEscrowHoldMapper {
  /**
   * Convert ORM EscrowHold entity to EscrowHold domain model
   */
  static toDomain(ormEscrow: ORMEscrowHold): EscrowHold {
    return new EscrowHold(
      ormEscrow.id,
      ormEscrow.orderId,
      ormEscrow.shopId,
      Number(ormEscrow.amount),
      Number(ormEscrow.orderSubtotal),
      Number(ormEscrow.coinUsed),
      Number(ormEscrow.platformFeePercent),
      ormEscrow.status,
      ormEscrow.releasedAt,
      ormEscrow.createdAt,
      ormEscrow.updatedAt,
    );
  }

  /**
   * Convert EscrowHold domain model to ORM entity
   */
  static toOrm(domainEscrow: EscrowHold): ORMEscrowHold {
    const ormEscrow = new ORMEscrowHold();
    ormEscrow.id = domainEscrow.id;
    ormEscrow.orderId = domainEscrow.orderId;
    ormEscrow.shopId = domainEscrow.shopId;
    ormEscrow.amount = domainEscrow.amount;
    ormEscrow.orderSubtotal = domainEscrow.orderSubtotal;
    ormEscrow.coinUsed = domainEscrow.coinUsed;
    ormEscrow.platformFeePercent = domainEscrow.platformFeePercent;
    ormEscrow.status = domainEscrow.status;
    ormEscrow.releasedAt = domainEscrow.releasedAt;
    ormEscrow.createdAt = domainEscrow.createdAt;
    ormEscrow.updatedAt = domainEscrow.updatedAt;
    return ormEscrow;
  }
}

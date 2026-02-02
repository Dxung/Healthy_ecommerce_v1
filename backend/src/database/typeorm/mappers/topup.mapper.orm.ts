import { ORMTopup } from '../entities/payment/orm.topup.entity';
import { Topup } from 'src/modules/payment/models/topup.model';

/**
 * Mapper for converting between ORM entities and domain models for Topup
 */
export class ORMTopupMapper {
  /**
   * Convert ORM Topup entity to Topup domain model
   */
  static toDomain(ormTopup: ORMTopup): Topup {
    return new Topup(
      ormTopup.id,
      ormTopup.walletId,
      Number(ormTopup.amount),
      ormTopup.status,
      ormTopup.failureReason,
      ormTopup.createdAt,
      ormTopup.processedAt,
    );
  }

  /**
   * Convert Topup domain model to ORM entity
   */
  static toOrm(domainTopup: Topup): ORMTopup {
    const ormTopup = new ORMTopup();
    ormTopup.id = domainTopup.id;
    ormTopup.walletId = domainTopup.walletId;
    ormTopup.amount = domainTopup.amount;
    ormTopup.status = domainTopup.status;
    ormTopup.failureReason = domainTopup.failureReason;
    ormTopup.createdAt = domainTopup.createdAt;
    ormTopup.processedAt = domainTopup.processedAt;
    return ormTopup;
  }
}

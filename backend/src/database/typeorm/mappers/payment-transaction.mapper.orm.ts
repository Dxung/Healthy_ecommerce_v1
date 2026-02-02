import { ORMPaymentTransaction } from '../entities/payment/orm.payment-transaction.entity';
import { PaymentTransaction } from 'src/modules/payment/models/payment-transaction.model';

/**
 * Mapper for converting between ORM entities and domain models for PaymentTransaction
 */
export class ORMPaymentTransactionMapper {
  /**
   * Convert ORM PaymentTransaction entity to PaymentTransaction domain model
   */
  static toDomain(ormPayment: ORMPaymentTransaction): PaymentTransaction {
    return new PaymentTransaction(
      ormPayment.id,
      ormPayment.topupId,
      ormPayment.orderId,
      ormPayment.type,
      Number(ormPayment.amount),
      ormPayment.status,
      ormPayment.vnpayTxnRef,
      ormPayment.vnpayTransactionNo,
      ormPayment.vnpayResponseCode,
      ormPayment.vnpayResponseMessage,
      ormPayment.vnpayBankCode,
      ormPayment.vnpayBankTranNo,
      ormPayment.vnpayPayDate,
      ormPayment.createdAt,
      ormPayment.updatedAt,
    );
  }

  /**
   * Convert PaymentTransaction domain model to ORM entity
   */
  static toOrm(domainPayment: PaymentTransaction): ORMPaymentTransaction {
    const ormPayment = new ORMPaymentTransaction();
    ormPayment.id = domainPayment.id;
    ormPayment.topupId = domainPayment.topupId;
    ormPayment.orderId = domainPayment.orderId;
    ormPayment.type = domainPayment.type;
    ormPayment.amount = domainPayment.amount;
    ormPayment.status = domainPayment.status;
    ormPayment.vnpayTxnRef = domainPayment.vnpayTxnRef;
    ormPayment.vnpayTransactionNo = domainPayment.vnpayTransactionNo;
    ormPayment.vnpayResponseCode = domainPayment.vnpayResponseCode;
    ormPayment.vnpayResponseMessage = domainPayment.vnpayResponseMessage;
    ormPayment.vnpayBankCode = domainPayment.vnpayBankCode;
    ormPayment.vnpayBankTranNo = domainPayment.vnpayBankTranNo;
    ormPayment.vnpayPayDate = domainPayment.vnpayPayDate;
    ormPayment.createdAt = domainPayment.createdAt;
    ormPayment.updatedAt = domainPayment.updatedAt;
    return ormPayment;
  }
}

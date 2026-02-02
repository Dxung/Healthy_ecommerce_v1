import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ORMTopup } from './orm.topup.entity';
import { PaymentStatus } from './enums/payment-status.enum';
import { PaymentType } from './enums/payment-type.enum';

/**
 * ORM Entity for payment_transactions table.
 * Represents VNPay payment records.
 * Links to either Order (for order payment) or Topup (for wallet topup).
 */
@Entity('payment_transactions', { schema: 'payment_schema' })
@Index('idx_payment_transactions_topup_id', ['topupId'])
@Index('idx_payment_transactions_order_id', ['orderId'])
@Index('idx_payment_transactions_vnpay_ref', ['vnpayTxnRef'])
@Index('idx_payment_transactions_status', ['status'])
export class ORMPaymentTransaction {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'topup_id', type: 'uuid', nullable: true })
  topupId: string | null;

  @Column({ name: 'order_id', type: 'uuid', nullable: true })
  orderId: string | null;

  @Column({
    type: 'enum',
    enum: PaymentType,
    enumName: 'payment_type_enum',
  })
  type: PaymentType;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    enumName: 'payment_status_enum',
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({
    name: 'vnpay_txn_ref',
    type: 'varchar',
    length: 100,
    unique: true,
  })
  vnpayTxnRef: string;

  @Column({
    name: 'vnpay_transaction_no',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  vnpayTransactionNo: string | null;

  @Column({
    name: 'vnpay_response_code',
    type: 'varchar',
    length: 10,
    nullable: true,
  })
  vnpayResponseCode: string | null;

  @Column({
    name: 'vnpay_response_message',
    type: 'text',
    nullable: true,
  })
  vnpayResponseMessage: string | null;

  @Column({
    name: 'vnpay_bank_code',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  vnpayBankCode: string | null;

  @Column({
    name: 'vnpay_bank_tran_no',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  vnpayBankTranNo: string | null;

  @Column({ name: 'vnpay_pay_date', type: 'timestamp', nullable: true })
  vnpayPayDate: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => ORMTopup)
  @JoinColumn({ name: 'topup_id' })
  topup: ORMTopup;
}

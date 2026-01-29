import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ORMWallet } from './orm.wallet.entity';
import { WalletTransactionType } from './enums/wallet-transaction-type.enum';

/**
 * ORM Entity for wallet_transactions table.
 * Immutable audit trail for all wallet operations.
 */
@Entity('wallet_transactions', { schema: 'payment_schema' })
@Index('idx_wallet_transactions_wallet_id', ['walletId'])
@Index('idx_wallet_transactions_created_at', ['createdAt'])
export class ORMWalletTransaction {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'wallet_id', type: 'uuid' })
  walletId: string;

  @Column({
    type: 'enum',
    enum: WalletTransactionType,
    enumName: 'wallet_transaction_type_enum',
  })
  type: WalletTransactionType;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({
    name: 'balance_before',
    type: 'decimal',
    precision: 15,
    scale: 2,
  })
  balanceBefore: number;

  @Column({
    name: 'balance_after',
    type: 'decimal',
    precision: 15,
    scale: 2,
  })
  balanceAfter: number;

  @Column({ name: 'reference_type', type: 'varchar', length: 50, nullable: true })
  referenceType: string | null;

  @Column({ name: 'reference_id', type: 'uuid', nullable: true })
  referenceId: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => ORMWallet)
  @JoinColumn({ name: 'wallet_id' })
  wallet: ORMWallet;
}

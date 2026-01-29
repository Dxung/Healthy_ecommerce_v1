import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { CoinTransactionType } from './enums/coin-transaction-type.enum';

/**
 * ORM Entity for buyer_coin_transactions table.
 * Immutable audit trail for all coin operations (earned/spent).
 */
@Entity('buyer_coin_transactions', { schema: 'buyer_schema' })
@Index('idx_coin_transactions_buyer_id', ['buyerId'])
@Index('idx_coin_transactions_created_at', ['createdAt'])
export class ORMBuyerCoinTransaction {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'buyer_id', type: 'uuid' })
  buyerId: string;

  @Column({
    type: 'enum',
    enum: CoinTransactionType,
    enumName: 'coin_transaction_type_enum',
  })
  type: CoinTransactionType;

  @Column({ type: 'bigint' })
  amount: number;

  @Column({ name: 'balance_before', type: 'bigint' })
  balanceBefore: number;

  @Column({ name: 'balance_after', type: 'bigint' })
  balanceAfter: number;

  @Column({ name: 'reference_type', type: 'varchar', length: 50 })
  referenceType: string;

  @Column({ name: 'reference_id', type: 'uuid', nullable: true })
  referenceId: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

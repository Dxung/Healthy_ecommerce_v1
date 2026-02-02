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
import { TopupStatus } from './enums/topup-status.enum';

/**
 * ORM Entity for topups table.
 * Represents wallet topup requests (similar to Order for checkout).
 */
@Entity('topups', { schema: 'payment_schema' })
@Index('idx_topups_wallet_id', ['walletId'])
@Index('idx_topups_status', ['status'])
@Index('idx_topups_status_created_at', ['status', 'createdAt'])
export class ORMTopup {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'wallet_id', type: 'uuid' })
  walletId: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: TopupStatus,
    enumName: 'topup_status_enum',
    default: TopupStatus.PROCESSING,
  })
  status: TopupStatus;

  @Column({
    name: 'failure_reason',
    type: 'text',
    nullable: true,
  })
  failureReason: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'processed_at', type: 'timestamp', nullable: true })
  processedAt: Date | null;

  // Relations
  @ManyToOne(() => ORMWallet)
  @JoinColumn({ name: 'wallet_id' })
  wallet: ORMWallet;
}

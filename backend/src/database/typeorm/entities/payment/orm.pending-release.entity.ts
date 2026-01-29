import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ORMEscrowHold } from './orm.escrow-hold.entity';
import { ORMWallet } from './orm.wallet.entity';
import { PendingReleaseStatus } from './enums/pending-release-status.enum';

/**
 * ORM Entity for pending_releases table.
 * Tracks escrow releases with retry logic.
 */
@Entity('pending_releases', { schema: 'payment_schema' })
@Index('idx_pending_releases_status', ['status'])
@Index('idx_pending_releases_next_retry_at', ['nextRetryAt'])
export class ORMPendingRelease {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'escrow_hold_id', type: 'uuid' })
  escrowHoldId: string;

  @Column({ name: 'shop_wallet_id', type: 'uuid' })
  shopWalletId: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: PendingReleaseStatus,
    enumName: 'pending_release_status_enum',
    default: PendingReleaseStatus.PENDING,
  })
  status: PendingReleaseStatus;

  @Column({ type: 'int', default: 0 })
  attempts: number;

  @Column({ name: 'max_attempts', type: 'int', default: 5 })
  maxAttempts: number;

  @Column({ name: 'last_error', type: 'text', nullable: true })
  lastError: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'processed_at', type: 'timestamp', nullable: true })
  processedAt: Date | null;

  @Column({ name: 'next_retry_at', type: 'timestamp', nullable: true })
  nextRetryAt: Date | null;

  // Relations
  @ManyToOne(() => ORMEscrowHold)
  @JoinColumn({ name: 'escrow_hold_id' })
  escrowHold: ORMEscrowHold;

  @ManyToOne(() => ORMWallet)
  @JoinColumn({ name: 'shop_wallet_id' })
  shopWallet: ORMWallet;
}

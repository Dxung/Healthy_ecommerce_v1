import {
  Entity,
  PrimaryColumn,
  Column,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { WalletOwnerType } from './enums/wallet-owner-type.enum';

/**
 * ORM Entity for wallets table.
 * Represents a wallet for buyers and shops.
 */
@Entity('wallets', { schema: 'payment_schema' })
@Index('idx_wallets_owner', ['ownerType', 'ownerId'])
export class ORMWallet {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({
    name: 'owner_type',
    type: 'enum',
    enum: WalletOwnerType,
    enumName: 'wallet_owner_type_enum',
  })
  ownerType: WalletOwnerType;

  @Column({ name: 'owner_id', type: 'uuid' })
  ownerId: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  balance: number;

  @Column({
    name: 'frozen_balance',
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
  })
  frozenBalance: number;

  @Column({
    name: 'min_balance',
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
  })
  minBalance: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

import {
  Entity,
  PrimaryColumn,
  Column,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * ORM Entity for buyer_coin_wallets table.
 * Stores coin balance for buyers earned through purchases.
 */
@Entity('buyer_coin_wallets', { schema: 'buyer_schema' })
@Index('idx_buyer_coin_wallet_buyer_id', ['buyerId'])
export class ORMBuyerCoinWallet {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'buyer_id', type: 'uuid' })
  buyerId: string;

  @Column({ type: 'bigint', default: 0 })
  balance: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

import {
  BuyerCoinWallet,
  CoinTransaction,
} from 'src/modules/buyer/models/buyer-coin-wallet.model';
import { ORMBuyerCoinWallet } from '../entities/buyer/orm.buyer-coin-wallet.entity';
import { ORMBuyerCoinTransaction } from '../entities/buyer/orm.buyer-coin-transaction.entity';

/**
 * Mapper for buyer coin wallet entities.
 */
export class ORMBuyerCoinWalletMapper {
  static toDomain(orm: ORMBuyerCoinWallet): BuyerCoinWallet {
    return BuyerCoinWallet.fromPersistence(
      orm.id,
      orm.buyerId,
      Number(orm.balance),
      orm.updatedAt,
    );
  }

  static toOrm(domain: BuyerCoinWallet): ORMBuyerCoinWallet {
    const orm = new ORMBuyerCoinWallet();
    orm.id = domain.id;
    orm.buyerId = domain.buyerId;
    orm.balance = domain.balance;
    // Don't set updatedAt - let @UpdateDateColumn handle it automatically
    return orm;
  }

  static transactionToDomain(orm: ORMBuyerCoinTransaction): CoinTransaction {
    return {
      id: orm.id,
      buyerId: orm.buyerId,
      type: orm.type,
      amount: Number(orm.amount),
      balanceBefore: Number(orm.balanceBefore),
      balanceAfter: Number(orm.balanceAfter),
      referenceType: orm.referenceType,
      referenceId: orm.referenceId,
      description: orm.description,
      createdAt: orm.createdAt,
    };
  }

  static transactionToOrm(domain: CoinTransaction): ORMBuyerCoinTransaction {
    const orm = new ORMBuyerCoinTransaction();
    orm.id = domain.id;
    orm.buyerId = domain.buyerId;
    orm.type = domain.type;
    orm.amount = domain.amount;
    orm.balanceBefore = domain.balanceBefore;
    orm.balanceAfter = domain.balanceAfter;
    orm.referenceType = domain.referenceType;
    orm.referenceId = domain.referenceId;
    orm.description = domain.description;
    // Don't set createdAt - let @CreateDateColumn handle it automatically
    return orm;
  }

  static transactionsToDomain(
    orms: ORMBuyerCoinTransaction[],
  ): CoinTransaction[] {
    return orms.map((orm) => this.transactionToDomain(orm));
  }
}

import { ORMWallet } from '../entities/payment/orm.wallet.entity';
import { ORMWalletTransaction } from '../entities/payment/orm.wallet-transaction.entity';
import { Wallet } from 'src/modules/payment/models/wallet.model';
import { WalletTransaction } from 'src/modules/payment/models/wallet-transaction.model';

/**
 * Mapper for converting between ORM entities and domain models for Wallet
 */
export class ORMWalletMapper {
  /**
   * Convert ORM Wallet entity to Wallet domain model
   */
  static toDomain(ormWallet: ORMWallet): Wallet {
    return new Wallet(
      ormWallet.id,
      ormWallet.ownerType,
      ormWallet.ownerId,
      Number(ormWallet.balance),
      Number(ormWallet.frozenBalance),
      Number(ormWallet.minBalance),
      ormWallet.updatedAt,
    );
  }

  /**
   * Convert Wallet domain model to ORM entity
   */
  static toOrm(domainWallet: Wallet): ORMWallet {
    const ormWallet = new ORMWallet();
    ormWallet.id = domainWallet.id;
    ormWallet.ownerType = domainWallet.ownerType;
    ormWallet.ownerId = domainWallet.ownerId;
    ormWallet.balance = domainWallet.balance;
    ormWallet.frozenBalance = domainWallet.frozenBalance;
    ormWallet.minBalance = domainWallet.minBalance;
    ormWallet.updatedAt = domainWallet.updatedAt;
    return ormWallet;
  }

  /**
   * Convert ORM WalletTransaction entity to WalletTransaction domain model
   */
  static transactionToDomain(
    ormTransaction: ORMWalletTransaction,
  ): WalletTransaction {
    return new WalletTransaction(
      ormTransaction.id,
      ormTransaction.walletId,
      ormTransaction.type,
      Number(ormTransaction.amount),
      Number(ormTransaction.balanceBefore),
      Number(ormTransaction.balanceAfter),
      ormTransaction.referenceType,
      ormTransaction.referenceId,
      ormTransaction.description,
      ormTransaction.createdAt,
    );
  }

  /**
   * Convert WalletTransaction domain model to ORM entity
   */
  static transactionToOrm(
    domainTransaction: WalletTransaction,
  ): ORMWalletTransaction {
    const ormTransaction = new ORMWalletTransaction();
    ormTransaction.id = domainTransaction.id;
    ormTransaction.walletId = domainTransaction.walletId;
    ormTransaction.type = domainTransaction.type;
    ormTransaction.amount = domainTransaction.amount;
    ormTransaction.balanceBefore = domainTransaction.balanceBefore;
    ormTransaction.balanceAfter = domainTransaction.balanceAfter;
    ormTransaction.referenceType = domainTransaction.referenceType;
    ormTransaction.referenceId = domainTransaction.referenceId;
    ormTransaction.description = domainTransaction.description;
    ormTransaction.createdAt = domainTransaction.createdAt;
    return ormTransaction;
  }
}

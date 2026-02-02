import { v7 as uuidv7 } from 'uuid';
import { CoinTransactionType } from 'src/database/typeorm/entities/buyer/enums/coin-transaction-type.enum';

/**
 * Represents a coin transaction in the buyer's coin wallet.
 */
export interface CoinTransaction {
  id: string;
  buyerId: string;
  type: CoinTransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceType: string;
  referenceId: string | null;
  description: string | null;
  createdAt: Date;
}

/**
 * Domain model for buyer's coin wallet.
 * Manages coin balance and transaction creation.
 */
export class BuyerCoinWallet {
  constructor(
    private readonly _id: string,
    private readonly _buyerId: string,
    private _balance: number,
    private _updatedAt: Date,
  ) {}

  /**
   * Creates a new coin wallet for a buyer.
   */
  static createNew(buyerId: string): BuyerCoinWallet {
    const now = new Date();
    return new BuyerCoinWallet(uuidv7(), buyerId, 0, now);
  }

  /**
   * Reconstructs a wallet from persistence.
   */
  static fromPersistence(
    id: string,
    buyerId: string,
    balance: number,
    updatedAt: Date,
  ): BuyerCoinWallet {
    return new BuyerCoinWallet(id, buyerId, balance, updatedAt);
  }

  /**
   * Creates a credit transaction (earned coins).
   * Returns the transaction record to be persisted.
   */
  creditCoins(
    amount: number,
    referenceType: string,
    referenceId: string | null,
    description: string | null,
  ): CoinTransaction {
    const balanceBefore = this._balance;
    this._balance += amount;
    this._updatedAt = new Date();

    return {
      id: uuidv7(),
      buyerId: this._buyerId,
      type: CoinTransactionType.EARNED,
      amount,
      balanceBefore,
      balanceAfter: this._balance,
      referenceType,
      referenceId,
      description,
      createdAt: new Date(),
    };
  }

  /**
   * Creates a debit transaction (spent coins).
   * Returns the transaction record to be persisted.
   * Throws if insufficient balance.
   */
  debitCoins(
    amount: number,
    referenceType: string,
    referenceId: string | null,
    description: string | null,
  ): CoinTransaction {
    if (this._balance < amount) {
      throw new Error('Insufficient coin balance');
    }

    const balanceBefore = this._balance;
    this._balance -= amount;
    this._updatedAt = new Date();

    return {
      id: uuidv7(),
      buyerId: this._buyerId,
      type: CoinTransactionType.SPENT,
      amount,
      balanceBefore,
      balanceAfter: this._balance,
      referenceType,
      referenceId,
      description,
      createdAt: new Date(),
    };
  }

  /**
   * Creates a refund transaction (refunded coins).
   * Returns the transaction record to be persisted.
   */
  refundCoins(
    amount: number,
    referenceType: string,
    referenceId: string | null,
    description: string | null,
  ): CoinTransaction {
    const balanceBefore = this._balance;
    this._balance += amount;
    this._updatedAt = new Date();

    return {
      id: uuidv7(),
      buyerId: this._buyerId,
      type: CoinTransactionType.REFUNDED,
      amount,
      balanceBefore,
      balanceAfter: this._balance,
      referenceType,
      referenceId,
      description,
      createdAt: new Date(),
    };
  }

  /**
   * Checks if wallet has sufficient balance for a debit.
   */
  hasEnoughBalance(amount: number): boolean {
    return this._balance >= amount;
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get buyerId(): string {
    return this._buyerId;
  }

  get balance(): number {
    return this._balance;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}

import { v7 as uuidv7 } from 'uuid';
import { Result, ok, err } from 'neverthrow';
import {
  createDomainError,
  DomainError,
} from 'src/shared/types/domain-error.type';
import { WalletOwnerType } from 'src/database/typeorm/entities/payment/enums/wallet-owner-type.enum';
import { PAYMENT_ERRORS } from '../errors/payment.errors';

/** Platform wallet ID - singleton wallet for the platform */
export const PLATFORM_WALLET_ID = '019c1d09-20bb-7c17-8900-4930e2a2af86';
/** Platform owner ID - used as ownerId for platform wallet */
export const PLATFORM_OWNER_ID = '019c1774-3fb3-72df-b6c7-e017dae96caf';

/**
 * Wallet Domain Model
 * Represents a wallet for buyers or shops.
 */
export class Wallet {
  constructor(
    private readonly _id: string,
    private readonly _ownerType: WalletOwnerType,
    private readonly _ownerId: string,
    private _balance: number,
    private _frozenBalance: number,
    private readonly _minBalance: number,
    private _updatedAt: Date,
  ) {}

  /**
   * Creates a new wallet for a buyer
   */
  static createForBuyer(buyerId: string): Wallet {
    return new Wallet(
      uuidv7(),
      WalletOwnerType.BUYER,
      buyerId,
      0, // balance
      0, // frozenBalance
      0, // minBalance
      new Date(),
    );
  }

  /**
   * Creates a new wallet for a shop
   */
  static createForShop(shopId: string): Wallet {
    return new Wallet(
      uuidv7(),
      WalletOwnerType.SHOP,
      shopId,
      0,
      0,
      0,
      new Date(),
    );
  }

  /**
   * Creates the platform wallet (singleton)
   * Uses a fixed ID to ensure only one platform wallet exists
   */
  static createForPlatform(): Wallet {
    return new Wallet(
      PLATFORM_WALLET_ID,
      WalletOwnerType.PLATFORM,
      PLATFORM_OWNER_ID,
      0,
      0,
      0,
      new Date(),
    );
  }

  /**
   * Gets the available balance (balance minus frozen)
   */
  get availableBalance(): number {
    return this._balance - this._frozenBalance;
  }

  /**
   * Checks if the wallet can be debited by the given amount
   */
  canDebit(amount: number): boolean {
    return this.availableBalance >= amount;
  }

  /**
   * Debits the wallet by the given amount
   * Returns the balance before the debit
   */
  debit(amount: number): Result<number, DomainError> {
    if (!this.canDebit(amount)) {
      return err(
        createDomainError(PAYMENT_ERRORS.INSUFFICIENT_BALANCE, { cause: null }),
      );
    }
    const balanceBefore = this._balance;
    this._balance = Number((this._balance - amount).toFixed(2));
    this._updatedAt = new Date();
    return ok(balanceBefore);
  }

  /**
   * Credits the wallet by the given amount
   * Returns the balance before the credit
   */
  credit(amount: number): number {
    const balanceBefore = this._balance;
    this._balance = Number((this._balance + amount).toFixed(2));
    this._updatedAt = new Date();
    return balanceBefore;
  }

  /**
   * Freezes the given amount
   */
  freeze(amount: number): Result<void, DomainError> {
    if (this._balance - this._frozenBalance < amount) {
      return err(
        createDomainError(PAYMENT_ERRORS.INSUFFICIENT_BALANCE, { cause: null }),
      );
    }
    this._frozenBalance = Number((this._frozenBalance + amount).toFixed(2));
    this._updatedAt = new Date();
    return ok(undefined);
  }

  /**
   * Unfreezes the given amount
   */
  unfreeze(amount: number): void {
    this._frozenBalance = Math.max(
      0,
      Number((this._frozenBalance - amount).toFixed(2)),
    );
    this._updatedAt = new Date();
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get ownerType(): WalletOwnerType {
    return this._ownerType;
  }

  get ownerId(): string {
    return this._ownerId;
  }

  get balance(): number {
    return this._balance;
  }

  get frozenBalance(): number {
    return this._frozenBalance;
  }

  get minBalance(): number {
    return this._minBalance;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}

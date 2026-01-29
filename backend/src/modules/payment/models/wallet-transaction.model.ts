import { v7 as uuidv7 } from 'uuid';
import { WalletTransactionType } from 'src/database/typeorm/entities/payment/enums/wallet-transaction-type.enum';

/**
 * WalletTransaction Domain Model
 * Immutable audit record for wallet operations.
 */
export class WalletTransaction {
  constructor(
    private readonly _id: string,
    private readonly _walletId: string,
    private readonly _type: WalletTransactionType,
    private readonly _amount: number,
    private readonly _balanceBefore: number,
    private readonly _balanceAfter: number,
    private readonly _referenceType: string | null,
    private readonly _referenceId: string | null,
    private readonly _description: string | null,
    private readonly _createdAt: Date,
  ) {}

  /**
   * Creates a new wallet transaction
   */
  static create(params: {
    walletId: string;
    type: WalletTransactionType;
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    referenceType?: string | null;
    referenceId?: string | null;
    description?: string | null;
  }): WalletTransaction {
    return new WalletTransaction(
      uuidv7(),
      params.walletId,
      params.type,
      params.amount,
      params.balanceBefore,
      params.balanceAfter,
      params.referenceType ?? null,
      params.referenceId ?? null,
      params.description ?? null,
      new Date(),
    );
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get walletId(): string {
    return this._walletId;
  }

  get type(): WalletTransactionType {
    return this._type;
  }

  get amount(): number {
    return this._amount;
  }

  get balanceBefore(): number {
    return this._balanceBefore;
  }

  get balanceAfter(): number {
    return this._balanceAfter;
  }

  get referenceType(): string | null {
    return this._referenceType;
  }

  get referenceId(): string | null {
    return this._referenceId;
  }

  get description(): string | null {
    return this._description;
  }

  get createdAt(): Date {
    return this._createdAt;
  }
}

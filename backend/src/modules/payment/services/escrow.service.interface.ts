import type { ResultAsync } from 'neverthrow';
import type { DomainError } from 'src/shared/types/domain-error.type';
import type { EscrowHold } from '../models/escrow-hold.model';

export interface IEscrowService {
  /**
   * Creates a new escrow hold for an order
   * @param orderId - Order ID
   * @param shopId - Shop ID
   * @param amount - Total amount held (buyer's payment)
   * @param orderSubtotal - Original order value before coin discount
   * @param coinUsed - Coins used by buyer
   * @param platformFeePercent - Platform fee percent (already includes badge discount)
   */
  createHold(
    orderId: string,
    shopId: string,
    amount: number,
    orderSubtotal: number,
    coinUsed: number,
    platformFeePercent: number,
  ): ResultAsync<EscrowHold, DomainError>;

  findByOrderId(orderId: string): ResultAsync<EscrowHold[], DomainError>;

  /**
   * Release escrow to shop.
   * NOTE: This method does NOT create its own transaction.
   * Caller must wrap this in a UoW transaction.
   */
  releaseToShop(escrowId: string): ResultAsync<void, DomainError>;

  refundToBuyer(
    escrowId: string,
    buyerId: string,
  ): ResultAsync<void, DomainError>;
}

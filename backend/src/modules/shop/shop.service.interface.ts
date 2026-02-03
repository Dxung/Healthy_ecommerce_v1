import type { ResultAsync } from 'neverthrow';
import type { DomainError } from 'src/shared/types/domain-error.type';
import type { Shop } from './models/shop.model';
import type { RegisterShopArgumentDto } from './dto';

export interface IShopService {
  /**
   * Single-step shop registration (no admin approval required).
   *
   * Creates a shop immediately with ACTIVE status.
   *
   * Business logic:
   * - Check user doesn't already own a shop
   * - Handle phone verification
   * - Validate location hierarchy (province->district->ward)
   * - Check shop name uniqueness via slug
   * - Create shop immediately with ACTIVE status
   * - Assign 'shop' role to user
   *
   * Requires AuthGuard to set userId in ALS.
   * @param dto - RegisterShopArgumentDto with shop info and optional Firebase OTP token
   * @returns A ResultAsync that resolves to the created Shop or DomainError.
   */
  registerShop(dto: RegisterShopArgumentDto): ResultAsync<Shop, DomainError>;

  /**
   * Gets the current user's shop.
   * Returns null if user doesn't own a shop.
   * Requires AuthGuard to set userId in ALS.
   * @returns A ResultAsync that resolves to Shop or null if none exists.
   */
  getMyShop(): ResultAsync<Shop | null, DomainError>;

  /**
   * Gets the current user's shop product slots information.
   * Requires AuthGuard to set userId in ALS.
   * @returns A ResultAsync that resolves to { currentCount, maxSlots }.
   */
  getProductSlotsInfo(): ResultAsync<
    { currentCount: number; maxSlots: number },
    DomainError
  >;
}

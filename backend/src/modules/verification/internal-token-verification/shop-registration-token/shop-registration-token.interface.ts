import { ResultAsync } from 'neverthrow';
import type { DomainError } from 'src/shared/types/domain-error.type';

/**
 * Data stored in shop registration token
 */
export interface ShopRegistrationTokenData {
  userId: string;
  name: string;
  slug: string;
  phone: string;
  email: string;
  addressLine: string;
  wardId: string;
  districtId: string;
  provinceId: string;
}

export interface IShopRegistrationTokenService {
  /**
   * Creates a token with shop registration data from Phase 1
   * @param data - The shop registration data to store
   * @returns A ResultAsync that resolves to the created token
   */
  createToken(
    data: ShopRegistrationTokenData,
  ): ResultAsync<{ token: string }, DomainError>;

  /**
   * Verifies token and retrieves shop registration data
   * Token is deleted after successful verification (one-time use)
   * @param token - The token to verify
   * @returns A ResultAsync that resolves to the stored data if valid
   */
  verifyToken(
    token: string,
  ): ResultAsync<ShopRegistrationTokenData, DomainError>;
}

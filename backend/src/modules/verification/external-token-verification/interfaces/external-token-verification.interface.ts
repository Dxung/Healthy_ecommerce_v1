import type { ResultAsync } from 'neverthrow';
import type { DomainError } from 'src/shared/types/domain-error.type';

/**
 * External Token Verification Service Interface
 * @param token - The external token to verify
 * @param type - The type of result expected
 * @returns A promise that resolves with the verification result
 */
export interface IExternalTokenVerificationService {
  /**
   * Verifies the external token and returns the associated phone number.
   * @param token - The external token to verify
   * @returns A promise that resolves with an object containing the phone number or null if verification fails
   */
  verifyTokenForPhone(
    token: string,
  ): ResultAsync<{ phone: string }, DomainError>;
}

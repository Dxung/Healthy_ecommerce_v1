import { ResultAsync } from 'neverthrow';
import type { DomainError } from 'src/shared/types/domain-error.type';

export interface IInternalTokenVerificationService {
  /**
   * Function to create Token with Phone Number
   * @param phone - The phone number to associate with the token
   * @returns A ResultAsync that resolves to an object containing the created token as a string
   */
  createTokenWithPhone(
    phone: string,
  ): ResultAsync<{ token: string }, DomainError>;

  /**
   * Function to verify Token and retrieve associated Phone Number
   * @param token - The OTP token to verify
   * @returns A ResultAsync that resolves to an object containing the phone number if verification is successful
   */
  verifyTokenForPhone(
    token: string,
  ): ResultAsync<{ phone: string }, DomainError>;
}

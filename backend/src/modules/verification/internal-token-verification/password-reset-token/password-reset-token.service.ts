import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { IInternalTokenVerificationService } from '../interfaces/internal-token-verification.interface';
import { PASSWORD_RESET_TOKEN_TTL } from './password-reset-token.config';
import { AUTH_ERRORS } from 'src/modules/auth/errors/auth.errors';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { SHARED_ERRORS } from 'src/shared/errors/shared.errors';
import { errAsync, ResultAsync } from 'neverthrow';

@Injectable()
export class PasswordResetTokenService
  implements IInternalTokenVerificationService
{
  // Prefix for keys stored in cache, cause CacheModule is shared across the application
  private readonly prefix = 'pwd-reset-token:';

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  /**
   * Function to create Token with Phone Number for password reset
   * @param phone - The phone number to associate with the token
   * @returns A ResultAsync that resolves to an object containing the created token as a string
   */
  @WithPosition()
  createTokenWithPhone(
    phone: string,
  ): ResultAsync<{ token: string }, DomainError> {
    const newToken = uuidv4();
    const key = `${this.prefix}${newToken}`;

    return ResultAsync.fromPromise(
      this.cacheManager.set(key, phone, PASSWORD_RESET_TOKEN_TTL),
      (error) => {
        return createDomainError(SHARED_ERRORS.CACHE_SERVICE_UNAVAILABLE, {
          cause: error,
        });
      },
    ).map(() => {
      return { token: newToken };
    });
  }

  /**
   * Function to verify Token and retrieve associated Phone Number
   * Token is deleted after successful verification (one-time use)
   * @param token - The password reset token to verify
   * @returns A ResultAsync that resolves to an object containing the phone number if verification is successful
   */
  @WithPosition()
  verifyTokenForPhone(
    token: string,
  ): ResultAsync<{ phone: string }, DomainError> {
    const key = `${this.prefix}${token}`;

    return ResultAsync.fromPromise(
      this.cacheManager.get<string>(key),
      (error) => {
        return createDomainError(SHARED_ERRORS.CACHE_SERVICE_UNAVAILABLE, {
          cause: error,
        });
      },
    ).andThen((phone) => {
      if (!phone) {
        return errAsync(
          createDomainError(AUTH_ERRORS.INVALID_OTP_TOKEN, {
            cause: 'No phone found for the provided password reset token',
          }),
        );
      }
      // Delete the token after successful verification (one-time use)
      return ResultAsync.fromPromise(this.cacheManager.del(key), (error) => {
        return createDomainError(SHARED_ERRORS.CACHE_SERVICE_UNAVAILABLE, {
          cause: error,
        });
      }).map(() => ({ phone }));
    });
  }
}

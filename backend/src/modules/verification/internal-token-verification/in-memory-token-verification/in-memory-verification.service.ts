import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { IInternalTokenVerificationService } from '../interfaces/internal-token-verification.interface';
import { REGISTRATION_TOKEN_TTL } from './configs/in-memory-token.config';
import { AUTH_ERRORS } from 'src/modules/auth/errors/auth.errors';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { SHARED_ERRORS } from 'src/shared/errors/shared.errors';
import { errAsync, ResultAsync } from 'neverthrow';

@Injectable()
export class RegistrationVerificationService
  implements IInternalTokenVerificationService
{
  //Prefix for keys stored in cache, cause CacheModule is shared across the application
  private readonly prefix = 'reg-token-temp:';

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  /**
   * Function to create Token with Phone Number
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
      this.cacheManager.set(key, phone, REGISTRATION_TOKEN_TTL),
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
   * @param token - The OTP token to verify
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
            cause: 'No phone found for the provided token',
          }),
        );
      }
      return ResultAsync.fromPromise(this.cacheManager.del(key), (error) => {
        return createDomainError(SHARED_ERRORS.CACHE_SERVICE_UNAVAILABLE, {
          cause: error,
        });
      }).map(() => ({ phone }));
    });
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  IShopRegistrationTokenService,
  ShopRegistrationTokenData,
} from './shop-registration-token.interface';
import { SHOP_REGISTRATION_TOKEN_TTL } from './shop-registration-token.config';
import { SHOP_ERRORS } from 'src/modules/shop/errors/shop.errors';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { SHARED_ERRORS } from 'src/shared/errors/shared.errors';
import { errAsync, Result, ResultAsync } from 'neverthrow';

@Injectable()
export class ShopRegistrationTokenService
  implements IShopRegistrationTokenService
{
  // Prefix for keys stored in cache, cause CacheModule is shared across the application
  private readonly prefix = 'shop-reg-token:';
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  /**
   * Creates a token with shop registration data from Phase 1
   * @param data - The shop registration data to store
   * @returns A ResultAsync that resolves to the created token
   */
  @WithPosition()
  createToken(
    data: ShopRegistrationTokenData,
  ): ResultAsync<{ token: string }, DomainError> {
    const newToken = uuidv4();
    const key = `${this.prefix}${newToken}`;

    return ResultAsync.fromPromise(
      this.cacheManager.set(
        key,
        JSON.stringify(data),
        SHOP_REGISTRATION_TOKEN_TTL,
      ),
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
   * Verifies token and retrieves shop registration data
   * Token is deleted after successful verification (one-time use)
   * @param token - The token to verify
   * @returns A ResultAsync that resolves to the stored data if valid
   */
  @WithPosition()
  verifyToken(
    token: string,
  ): ResultAsync<ShopRegistrationTokenData, DomainError> {
    const key = `${this.prefix}${token}`;

    return ResultAsync.fromPromise(
      this.cacheManager.get<string>(key),
      (error) => {
        return createDomainError(SHARED_ERRORS.CACHE_SERVICE_UNAVAILABLE, {
          cause: error,
        });
      },
    ).andThen((dataString) => {
      if (!dataString) {
        return errAsync(
          createDomainError(SHOP_ERRORS.INVALID_REGISTRATION_TOKEN, {
            cause: 'Token not found or expired',
          }),
        );
      }

      // Parse the stored data using Result.fromThrowable
      const safeJsonParse = Result.fromThrowable(
        (str: string) => JSON.parse(str) as ShopRegistrationTokenData,
        () =>
          createDomainError(SHOP_ERRORS.INVALID_REGISTRATION_TOKEN, {
            cause: 'Invalid token data format',
          }),
      );

      const parseResult = safeJsonParse(dataString);
      if (parseResult.isErr()) {
        return errAsync(parseResult.error);
      }

      const data = parseResult.value;

      // Delete the token after successful verification (one-time use)
      return ResultAsync.fromPromise(this.cacheManager.del(key), (error) => {
        return createDomainError(SHARED_ERRORS.CACHE_SERVICE_UNAVAILABLE, {
          cause: error,
        });
      }).map(() => data);
    });
  }
}

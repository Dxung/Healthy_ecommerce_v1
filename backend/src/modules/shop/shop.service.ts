import { Inject, Injectable } from '@nestjs/common';
import { IShopService } from './shop.service.interface';
import { SHOP_REPOSITORY } from 'src/database/typeorm/tokens/database.token';
import type { IShopRepository } from './repository/shop.repository.interface';
import type { IUserService } from '../user/user.service.interface';
import { USER_SERVICE } from '../user/tokens/user.token';
import type { ILocationService } from '../location/location.service.interface';
import { LOCATION_SERVICE } from '../location/tokens/location.token';
import type { IExternalTokenVerificationService } from '../verification/external-token-verification/interfaces/external-token-verification.interface';
import { EXTERNAL_TOKEN_VERIFICATION_SERVICE } from '../verification/tokens/verification.token';
import type { IAuthorizationService } from '../authorization/authorization.service.interface';
import { AUTHORIZATION_SERVICE } from '../authorization/tokens/authorization.token';
import type { IUow } from 'src/shared/unitOfWork/interfaces/uow.interface';
import { UOW_TOKEN } from 'src/shared/unitOfWork/tokens/uow.token';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { Shop } from './models/shop.model';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import { errAsync, okAsync, ResultAsync } from 'neverthrow';
import { AsyncLocalStorage } from 'async_hooks';
import type { ITypeORMAlsStore } from 'src/shared/als/interfaces/als-store.interface';
import { SHARED_ERRORS } from 'src/shared/errors/shared.errors';
import { SHOP_ERRORS } from './errors/shop.errors';
import { LOCATION_ERRORS } from '../location/errors/location.errors';
import { AUTH_ERRORS } from '../auth/errors/auth.errors';
import type { RegisterShopArgumentDto } from './dto';
import type { IShopBadgeBenefitsService } from './shop-badge-benefits.service.interface';
import { SHOP_BADGE_BENEFITS_SERVICE } from './tokens/shop.token';

@Injectable()
export class ShopService implements IShopService {
  constructor(
    @Inject(SHOP_REPOSITORY)
    private readonly shopRepository: IShopRepository,
    @Inject(USER_SERVICE)
    private readonly userService: IUserService,
    @Inject(LOCATION_SERVICE)
    private readonly locationService: ILocationService,
    @Inject(EXTERNAL_TOKEN_VERIFICATION_SERVICE)
    private readonly firebaseVerificationService: IExternalTokenVerificationService,
    @Inject(AUTHORIZATION_SERVICE)
    private readonly authorizationService: IAuthorizationService,
    @Inject(UOW_TOKEN)
    private readonly uow: IUow,
    @Inject(SHOP_BADGE_BENEFITS_SERVICE)
    private readonly shopBadgeBenefitsService: IShopBadgeBenefitsService,
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
  ) {}

  /**
   * Single-step shop registration - creates shop immediately without admin approval.
   *
   * Flow:
   * 1. Check user doesn't already own a shop
   * 2. Handle phone verification (same logic as initRegistration)
   * 3. Validate location hierarchy
   * 4. Check shop name uniqueness via slug
   * 5. Create shop immediately with ACTIVE status
   * 6. Assign 'shop' role to user
   */
  @WithPosition()
  registerShop(dto: RegisterShopArgumentDto): ResultAsync<Shop, DomainError> {
    // Step 1: Get current user ID from ALS
    const store = this.als.getStore();
    const userId = store?.userId;

    if (!userId) {
      return errAsync(
        createDomainError(SHARED_ERRORS.SYSTEM_ERROR, {
          cause: 'User ID not found in context',
        }),
      );
    }

    // Step 2: Check if user already owns a shop
    return (
      this.shopRepository
        .existsByUserId(userId)
        .andThen((hasShop) => {
          if (hasShop) {
            return errAsync(
              createDomainError(SHOP_ERRORS.ALREADY_HAS_SHOP, {
                cause: 'User already owns a shop',
              }),
            );
          }
          return okAsync(undefined);
        })
        // Step 3: Handle phone verification
        .andThen(() => this.userService.getCurrentUser())
        .andThen((user) => {
          const userHasPhone = user.phoneNumber !== null;
          const tokenProvided = !!dto.firebaseOtpToken;

          // Case 1: User has phone + token provided → REJECT (bypass attempt)
          if (userHasPhone && tokenProvided) {
            return errAsync(
              createDomainError(SHOP_ERRORS.USER_ALREADY_HAS_PHONE, {
                cause:
                  'User already has a phone number. OTP verification is not needed.',
              }),
            );
          }

          // Case 2: User has phone + no token → use user's phone from DB directly
          if (userHasPhone && !tokenProvided) {
            return okAsync(user.phoneNumber);
          }

          // Case 3: User has no phone + no token → ERROR (need phone verification)
          if (!userHasPhone && !tokenProvided) {
            return errAsync(
              createDomainError(SHOP_ERRORS.PHONE_VERIFICATION_REQUIRED, {
                cause:
                  'User has no phone number. OTP verification is required.',
              }),
            );
          }

          // Case 4: User has no phone + token provided → verify token
          return this.firebaseVerificationService
            .verifyTokenForPhone(dto.firebaseOtpToken!)
            .andThen((otpResult) => {
              // Validate phone matches dto.phone
              if (otpResult.phone !== dto.phone) {
                return errAsync(
                  createDomainError(AUTH_ERRORS.PHONE_MISMATCH, {
                    cause: 'Phone number does not match OTP token',
                  }),
                );
              }
              return okAsync(dto.phone);
            })
            .andThen((verifiedPhone) => {
              // Update user's phone number
              return this.userService
                .setPhoneForCurrentUser(verifiedPhone)
                .map(() => verifiedPhone);
            });
        })
        // Step 4: Validate location hierarchy
        .andThen((verifiedPhone) => {
          return this.locationService
            .validateLocation(dto.provinceId, dto.districtId, dto.wardId)
            .andThen((isValid) => {
              if (!isValid) {
                return errAsync(
                  createDomainError(
                    LOCATION_ERRORS.LOCATION_HIERARCHY_INVALID,
                    {
                      cause: 'Location validation failed',
                    },
                  ),
                );
              }
              return okAsync(verifiedPhone);
            });
        })
        // Step 5: Check shop name uniqueness via slug
        .andThen((verifiedPhone) => {
          const slug = Shop.generateSlug(dto.name);
          return this.shopRepository.existsBySlug(slug).andThen((exists) => {
            if (exists) {
              return errAsync(
                createDomainError(SHOP_ERRORS.SHOP_NAME_ALREADY_EXISTS, {
                  cause: 'Shop name (slug) already taken',
                }),
              );
            }
            return okAsync({ slug, verifiedPhone });
          });
        })
        // Step 6: Create shop and assign role in transaction
        .andThen(({ slug, verifiedPhone }) => {
          return this.uow.executeInTransaction(() => {
            // Create shop domain model
            const shop = Shop.createNew({
              userId,
              name: dto.name,
              slug,
              phone: verifiedPhone,
              email: dto.email,
              addressLine: dto.addressLine,
              wardId: dto.wardId,
              districtId: dto.districtId,
              provinceId: dto.provinceId,
            });

            // Save shop to database
            return this.shopRepository.create(shop).andThen((createdShop) => {
              // Assign 'shop' role to the user
              return this.authorizationService
                .assignRoleToUser(userId, 'shop', userId)
                .map(() => createdShop);
            });
          });
        })
    );
  }

  /**
   * Gets the current user's shop.
   * Returns null if user doesn't own a shop.
   */
  @WithPosition()
  getMyShop(): ResultAsync<Shop | null, DomainError> {
    // Step 1: Get current user ID from ALS
    const store = this.als.getStore();
    if (!store?.userId) {
      return errAsync(
        createDomainError(SHARED_ERRORS.SYSTEM_ERROR, {
          cause: SHARED_ERRORS.SYSTEM_ERROR.message,
        }),
      );
    }

    // Step 2: Find shop by user ID
    return this.shopRepository.findByUserId(store.userId);
  }

  /**
   * Gets the current user's shop product slots information.
   */
  @WithPosition()
  getProductSlotsInfo(): ResultAsync<
    { currentCount: number; maxSlots: number },
    DomainError
  > {
    const store = this.als.getStore();
    if (!store?.userId) {
      return errAsync(
        createDomainError(SHARED_ERRORS.SYSTEM_ERROR, {
          cause: 'User ID not found in context',
        }),
      );
    }

    return this.shopRepository.findByUserId(store.userId).andThen((shop) => {
      if (!shop) {
        return errAsync(
          createDomainError(SHOP_ERRORS.SHOP_NOT_FOUND, {
            cause: 'User does not own a shop',
          }),
        );
      }

      // Get current product count and max slots from badge benefits
      return this.shopBadgeBenefitsService
        .getShopBadgeBenefits(shop.id)
        .map((benefits) => ({
          currentCount: shop.totalProducts,
          maxSlots: benefits.maxProductSlots ?? 50, // fallback to 50 if somehow null
        }));
    });
  }
}

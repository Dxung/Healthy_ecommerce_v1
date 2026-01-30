import { Inject, Injectable } from '@nestjs/common';
import {
  IShopService,
  RegistrationWithLocationNames,
} from './shop.service.interface';
import {
  SHOP_REGISTRATION_REQUEST_REPOSITORY,
  SHOP_REPOSITORY,
} from 'src/database/typeorm/tokens/database.token';
import type { IShopRegistrationRequestRepository } from './repository/shop-registration-request.repository.interface';
import type { IShopRepository } from './repository/shop.repository.interface';
import type { IUserService } from '../user/user.service.interface';
import { USER_SERVICE } from '../user/tokens/user.token';
import type { ILocationService } from '../location/location.service.interface';
import { LOCATION_SERVICE } from '../location/tokens/location.token';
import type { IExternalTokenVerificationService } from '../verification/external-token-verification/interfaces/external-token-verification.interface';
import type { IShopRegistrationTokenService } from '../verification/internal-token-verification/shop-registration-token/shop-registration-token.interface';
import {
  EXTERNAL_TOKEN_VERIFICATION_SERVICE,
  SHOP_REGISTRATION_TOKEN_SERVICE,
} from '../verification/tokens/verification.token';
import type { IAuthorizationService } from '../authorization/authorization.service.interface';
import { AUTHORIZATION_SERVICE } from '../authorization/tokens/authorization.token';
import type { IUow } from 'src/shared/unitOfWork/interfaces/uow.interface';
import { UOW_TOKEN } from 'src/shared/unitOfWork/tokens/uow.token';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import {
  ShopRegistrationRequest,
  CreateShopRegistrationData,
} from './models/shop-registration-request.model';
import { Shop } from './models/shop.model';
import { ShopBadgeAssignment } from './models/shop-badge-assignment.model';
import { ShopRegistrationStatus } from 'src/database/typeorm/entities/shop/enums/shop-registration-status.enum';
import { ShopBadgeCode } from 'src/database/typeorm/entities/shop/enums/shop-badge-code.enum';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import { errAsync, okAsync, ResultAsync } from 'neverthrow';
import { AsyncLocalStorage } from 'async_hooks';
import type { ITypeORMAlsStore } from 'src/shared/als/interfaces/als-store.interface';
import { SHARED_ERRORS } from 'src/shared/errors/shared.errors';
import { SHOP_ERRORS } from './errors/shop.errors';
import { LOCATION_ERRORS } from '../location/errors/location.errors';
import { AUTH_ERRORS } from '../auth/errors/auth.errors';
import {
  ApproveBadgeType,
  type ApproveRegistrationArgumentDto,
  type InitShopRegistrationArgumentDto,
  type CompleteShopRegistrationArgumentDto,
  type RegisterShopArgumentDto,
} from './dto';

@Injectable()
export class ShopService implements IShopService {
  constructor(
    @Inject(SHOP_REGISTRATION_REQUEST_REPOSITORY)
    private readonly registrationRepository: IShopRegistrationRequestRepository,
    @Inject(SHOP_REPOSITORY)
    private readonly shopRepository: IShopRepository,
    @Inject(USER_SERVICE)
    private readonly userService: IUserService,
    @Inject(LOCATION_SERVICE)
    private readonly locationService: ILocationService,
    @Inject(EXTERNAL_TOKEN_VERIFICATION_SERVICE)
    private readonly firebaseVerificationService: IExternalTokenVerificationService,
    @Inject(SHOP_REGISTRATION_TOKEN_SERVICE)
    private readonly shopRegistrationTokenService: IShopRegistrationTokenService,
    @Inject(AUTHORIZATION_SERVICE)
    private readonly authorizationService: IAuthorizationService,
    @Inject(UOW_TOKEN)
    private readonly uow: IUow,
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
  ) {}

  //================================================== SINGLE-STEP SHOP REGISTRATION ==================================================

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
    return this.shopRepository
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
      // Step 3: Handle phone verification (same logic as initRegistration)
      .andThen(() => this.userService.getCurrentUser())
      .andThen((user) => {
        const userHasPhone = user.phoneNumber !== null;
        const tokenProvided = !!dto.firebaseOtpToken;

        // Case 1: User has phone + token provided → REJECT (bypass attempt)
        if (userHasPhone && tokenProvided) {
          return errAsync(
            createDomainError(SHOP_ERRORS.USER_ALREADY_HAS_PHONE, {
              cause: 'User already has a phone number. OTP verification is not needed.',
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
              cause: 'User has no phone number. OTP verification is required.',
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
                createDomainError(LOCATION_ERRORS.LOCATION_HIERARCHY_INVALID, {
                  cause: 'Location validation failed',
                }),
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
          return this.shopRepository
            .create(shop)
            .andThen((createdShop) => {
              // Assign 'shop' role to the user
              return this.authorizationService
                .assignRoleToUser(userId, 'shop', userId)
                .map(() => createdShop);
            });
        });
      });
  }

  //================================================== BUYER REGISTRATION (2-PHASE) ==================================================

  /**
   * Phase 1: Initializes shop registration.
   * Phone verification flow:
   * - If user already has phone + token provided → REJECT (bypass attempt)
   * - If user already has phone + no token → verify dto.phone matches user's phone
   * - If user has no phone + token provided → verify token, update user's phone
   * - If user has no phone + no token → ERROR (phone verification required)
   */
  @WithPosition()
  initRegistration(
    dto: InitShopRegistrationArgumentDto,
  ): ResultAsync<{ token: string }, DomainError> {
    // Step 1: Get current user ID from ALS (set by AuthGuard)
    const store = this.als.getStore();
    const userId = store?.userId;

    // If no userId in ALS, return error (shouldn't happen if AuthGuard is used)
    if (!userId) {
      return errAsync(
        createDomainError(SHARED_ERRORS.SYSTEM_ERROR, {
          cause: SHARED_ERRORS.SYSTEM_ERROR.message,
        }),
      );
    }

    // Step 2: Get current user to check phone status
    return this.userService
      .getCurrentUser()
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
        // (dto.phone might be masked from frontend, so we ignore it and use the real phone)
        if (userHasPhone && !tokenProvided) {
          return okAsync(user.phoneNumber);
        }

        // Case 3: User has no phone + no token → ERROR (need phone verification)
        if (!userHasPhone && !tokenProvided) {
          return errAsync(
            createDomainError(SHOP_ERRORS.PHONE_VERIFICATION_REQUIRED, {
              cause: 'User has no phone number. OTP verification is required.',
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
      .andThen((verifiedPhone) => {
        // Step 3: Validate location hierarchy
        return this.locationService
          .validateLocation(dto.provinceId, dto.districtId, dto.wardId)
          .andThen((isValid) => {
            if (!isValid) {
              return errAsync(
                createDomainError(LOCATION_ERRORS.LOCATION_HIERARCHY_INVALID, {
                  cause: 'Location validation failed',
                }),
              );
            }
            return okAsync(verifiedPhone);
          });
      })
      .andThen((verifiedPhone) => {
        // Step 4: Check shop name uniqueness via slug
        const slug = ShopRegistrationRequest.generateSlug(dto.name);
        return this.registrationRepository
          .existsBySlugExcludingRejected(slug)
          .andThen((exists) => {
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
      .andThen(({ slug, verifiedPhone }) => {
        // Step 5: Check if user already has a pending registration
        return this.registrationRepository
          .findPendingByUserId(userId)
          .andThen((existingPending) => {
            if (existingPending) {
              return errAsync(
                createDomainError(SHOP_ERRORS.ALREADY_HAS_PENDING_REQUEST, {
                  cause: 'User already has a pending registration',
                }),
              );
            }
            return okAsync({ slug, verifiedPhone });
          });
      })
      .andThen(({ slug, verifiedPhone }) => {
        // Step 6: Create internal token with validated data
        return this.shopRegistrationTokenService.createToken({
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
      });
  }

  /**
   * Phase 2: Completes shop registration with documents.
   * Verifies internal token, creates registration in database.
   */
  @WithPosition()
  completeRegistration(
    dto: CompleteShopRegistrationArgumentDto,
  ): ResultAsync<ShopRegistrationRequest, DomainError> {
    // Step 1: Verify internal token and retrieve stored data
    return this.shopRegistrationTokenService
      .verifyToken(dto.token)
      .andThen((tokenData) => {
        // Step 2: Create registration data from token + documents
        const registrationData: CreateShopRegistrationData = {
          name: tokenData.name,
          phone: tokenData.phone,
          email: tokenData.email,
          addressLine: tokenData.addressLine,
          wardId: tokenData.wardId,
          districtId: tokenData.districtId,
          provinceId: tokenData.provinceId,
          requestedBrandId: dto.requestedBrandId,
          documents: dto.documents?.map((doc) => ({
            documentTypeId: doc.documentTypeId,
            imageUrl: doc.imageUrl,
            expiresAt: doc.expiresAt ? new Date(doc.expiresAt) : undefined,
          })),
          brandDocuments: dto.brandDocuments?.map((doc) => ({
            documentTypeId: doc.documentTypeId,
            imageUrl: doc.imageUrl,
            expiresAt: doc.expiresAt ? new Date(doc.expiresAt) : undefined,
          })),
        };

        // Step 3: Create domain model with pre-generated slug from token
        const registration = ShopRegistrationRequest.createNewWithSlug(
          tokenData.userId,
          tokenData.slug,
          registrationData,
        );

        // Step 4: Save to database
        return this.registrationRepository.create(registration);
      });
  }

  /**
   * Gets the current user's most recent registration request.
   */
  @WithPosition()
  getMyRegistration(): ResultAsync<
    ShopRegistrationRequest | null,
    DomainError
  > {
    // Step 1: Get current user ID from ALS
    const store = this.als.getStore();
    if (!store?.userId) {
      return errAsync(
        createDomainError(SHARED_ERRORS.SYSTEM_ERROR, {
          cause: SHARED_ERRORS.SYSTEM_ERROR.message,
        }),
      );
    }

    // Step 2: Find registration by user ID
    return this.registrationRepository.findByUserId(store.userId);
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

  //================================================== ADMIN REGISTRATION MANAGEMENT ==================================================

  /**
   * Gets all registration requests with optional status filter.
   */
  @WithPosition()
  getRegistrations(
    status?: ShopRegistrationStatus,
  ): ResultAsync<ShopRegistrationRequest[], DomainError> {
    if (status) {
      return this.registrationRepository.findAllByStatus(status);
    }
    return this.registrationRepository.findAll();
  }

  /**
   * Gets a registration request by ID.
   */
  @WithPosition()
  getRegistrationById(
    id: string,
  ): ResultAsync<RegistrationWithLocationNames, DomainError> {
    return this.registrationRepository.findById(id).andThen((registration) => {
      if (!registration) {
        return errAsync(
          createDomainError(SHOP_ERRORS.REGISTRATION_NOT_FOUND, {
            cause: `Registration with ID ${id} not found`,
          }),
        );
      }

      // Fetch location names
      return this.locationService
        .getLocationNames(
          registration.provinceId,
          registration.districtId,
          registration.wardId,
        )
        .map((locationNames) => ({
          registration,
          locationNames,
        }));
    });
  }

  /**
   * Approves a registration request and creates a shop.
   *
   * **Full Flow:**
   * 1. Get admin ID from context (ALS)
   * 2. Fetch registration by ID
   * 3. Check if user already has a shop → error if yes
   * 4. Call registration.approve() to validate status and mark as approved
   * 5. In transaction:
   *    a. Create shop entity from registration data
   *    b. Save shop to database
   *    c. If badge requested (approveBadge), create badge assignment
   *    d. Assign 'shop' role to the user
   *    e. Update registration status in database
   * 6. Return created shop
   *
   * @param id - Registration ID to approve
   * @param dto - Approval options (approveShopOnly, approveBadge)
   * @returns Created Shop with badge assignments (if any)
   */
  @WithPosition()
  approveRegistration(
    id: string,
    dto: ApproveRegistrationArgumentDto,
  ): ResultAsync<Shop, DomainError> {
    // ========== Step 1: Get admin ID from ALS context ==========
    const store = this.als.getStore();
    if (!store?.userId) {
      return errAsync(
        createDomainError(SHARED_ERRORS.SYSTEM_ERROR, {
          cause: 'Admin ID not found in context',
        }),
      );
    }
    const adminId = store.userId;

    // ========== Step 2: Fetch registration by ID ==========
    return (
      this.getRegistrationById(id)
        // Extract registration from result
        .map(({ registration }) => registration)

        // ========== Step 3: Check if user already has a shop ==========
        .andThen((registration) => {
          return this.shopRepository
            .existsByUserId(registration.userId)
            .andThen((hasShop) => {
              if (hasShop) {
                return errAsync(
                  createDomainError(SHOP_ERRORS.ALREADY_HAS_SHOP, {
                    cause: 'User already owns a shop',
                  }),
                );
              }
              return okAsync(registration);
            });
        })

        // ========== Step 4: Approve registration (validates status is PENDING) ==========
        .andThen((registration) => {
          const approveResult = registration.approve(adminId);
          if (approveResult.isErr()) {
            return errAsync(approveResult.error);
          }
          return okAsync(registration);
        })

        // ========== Step 5: Execute all database operations in transaction ==========
        .andThen((registration) => {
          return this.uow.executeInTransaction(() => {
            // ----- Step 5a: Create shop domain model from registration data -----
            const shop = Shop.createFromRegistration(registration);

            // ----- Step 5b: Save shop to database -----
            return (
              this.shopRepository
                .create(shop)

                // ----- Step 5c: Create badge assignment if requested -----
                .andThen((createdShop) => {
                  // Skip badge creation if approveShopOnly=true or no approveBadge specified
                  if (!dto.approveShopOnly && dto.approveBadge) {
                    // Determine badge code from DTO
                    const badgeCode =
                      dto.approveBadge === ApproveBadgeType.APPROVED
                        ? ShopBadgeCode.APPROVED
                        : ShopBadgeCode.OFFICIAL;

                    // Create badge assignment domain model
                    const badge = ShopBadgeAssignment.createNew(
                      createdShop.id,
                      badgeCode,
                    );

                    // Save badge assignment and attach to shop
                    return this.shopRepository
                      .createBadgeAssignment(badge)
                      .andThen((createdBadge) => {
                        createdShop.addBadgeAssignment(createdBadge);
                        return okAsync(createdShop);
                      });
                  }
                  return okAsync(createdShop);
                })

                // ----- Step 5d: Assign 'shop' role to the user -----
                .andThen((shopWithBadge) => {
                  return this.authorizationService
                    .assignRoleToUser(registration.userId, 'shop', adminId)
                    .map(() => shopWithBadge);
                })

                // ----- Step 5e: Update registration status to APPROVED in database -----
                .andThen((shopWithBadge) => {
                  return this.registrationRepository
                    .update(registration)
                    .map(() => shopWithBadge);
                })
            );
          });
        })
    );
  }

  /**
   * Rejects a registration request.
   */
  @WithPosition()
  rejectRegistration(
    id: string,
    reason: string,
  ): ResultAsync<void, DomainError> {
    const store = this.als.getStore();
    if (!store?.userId) {
      return errAsync(
        createDomainError(SHARED_ERRORS.SYSTEM_ERROR, {
          cause: 'Admin ID not found in context',
        }),
      );
    }
    const adminId = store.userId;

    return this.getRegistrationById(id)
      .map(({ registration }) => registration)
      .andThen((registration) => {
        // Reject the registration (domain method validates status)
        const rejectResult = registration.reject(adminId, reason);
        if (rejectResult.isErr()) {
          return errAsync(rejectResult.error);
        }

        // Update registration status
        return this.registrationRepository
          .update(registration)
          .map(() => undefined);
      });
  }
}

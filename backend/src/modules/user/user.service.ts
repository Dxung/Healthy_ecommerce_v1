import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IUserService,
  AddressWithLocationNames,
} from './user.service.interface';
import { MAX_ADDRESSES_PER_USER } from './constants/user.constants';
import {
  USER_CORE_REPOSITORY,
  USER_ADDRESS_REPOSITORY,
} from 'src/database/typeorm/tokens/database.token';
import type { IUserCoreRepository } from './repository/user-core.repository.interface';
import type { IUserAddressRepository } from './repository/user-address.repository.interface';
import type { ILocationService } from '../location/location.service.interface';
import { LOCATION_SERVICE } from '../location/tokens/location.token';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { User } from './models/user.model';
import { UserAddress } from './models/user-address.model';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import { errAsync, okAsync, ResultAsync } from 'neverthrow';
import { AsyncLocalStorage } from 'async_hooks';
import type { ITypeORMAlsStore } from 'src/shared/als/interfaces/als-store.interface';
import { SHARED_ERRORS } from 'src/shared/errors/shared.errors';
import type {
  UpdateProfileArgumentDto,
  CreateAddressArgumentDto,
  UpdateAddressArgumentDto,
} from './dto';
import { EXTERNAL_TOKEN_VERIFICATION_SERVICE } from '../verification/tokens/verification.token';
import type { IExternalTokenVerificationService } from '../verification/external-token-verification/interfaces/external-token-verification.interface';
import { isValidVietnamesePhone } from 'src/common/utils/validate-phone.util';
import { USER_ERRORS } from './errors/user.errors';
import { UOW_TOKEN } from 'src/shared/unitOfWork/tokens/uow.token';
import type { IUow } from 'src/shared/unitOfWork/interfaces/uow.interface';
import { v7 as uuidv7 } from 'uuid';
import { IMAGE_PROCESSING_SERVICE } from 'src/shared/image-processing/tokens/image-processing.token';
import type { IImageProcessingService } from 'src/shared/image-processing/interfaces/image-processing.service.interface';

@Injectable()
export class UserService implements IUserService {
  constructor(
    @Inject(USER_CORE_REPOSITORY)
    private readonly userCoreRepository: IUserCoreRepository,
    @Inject(USER_ADDRESS_REPOSITORY)
    private readonly userAddressRepository: IUserAddressRepository,
    @Inject(LOCATION_SERVICE)
    private readonly locationService: ILocationService,
    @Inject(UOW_TOKEN)
    private readonly transactionUow: IUow,
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
    private readonly configService: ConfigService,
    @Inject(EXTERNAL_TOKEN_VERIFICATION_SERVICE)
    private readonly externalTokenVerificationService: IExternalTokenVerificationService,
    @Inject(IMAGE_PROCESSING_SERVICE)
    private readonly imageProcessingService: IImageProcessingService,
  ) {}

  //================================================== USER LOOKUP & CREATION ==================================================
  /**
   * Finds a user by their phone number.
   * @param phoneNumber - The phone number to search for.
   * @returns A promise that resolves to the User instance if found, or null if not found.
   */
  @WithPosition()
  findUserUsingPhoneNumber(
    phoneNumber: string,
  ): ResultAsync<User | null, DomainError> {
    return this.userCoreRepository.findUserByPhone(phoneNumber);
  }

  /**
   * Checks if a username is available.
   * @param username - The username to check for availability.
   * @returns A ResultAsync that resolves to true if the username is available, false otherwise, and UserErrorType on error.
   */
  @WithPosition()
  checkUsernameAvailability(
    username: string,
  ): ResultAsync<boolean, DomainError> {
    return this.userCoreRepository.isUsernameAvailable(username);
  }

  /**
   * creates a new user when using phone number registration
   * @param phoneNumber Phone number of the new user
   * @param username Username wanted for new user
   * @return ResultAsync that resolves to created User instance if success, otherwise return DomainError
   */
  @WithPosition()
  createNewUserByPhone(
    phoneNumber: string,
    username: string,
  ): ResultAsync<User, DomainError> {
    const defaultAvatarUrl =
      this.configService.get<string>('DEFAULT_AVATAR_URL') || '';
    const newUser = User.createNewUser(username, defaultAvatarUrl, {
      phoneNumber: phoneNumber,
    });
    return this.userCoreRepository.createUserWithPhone(newUser);
  }

  /**
   * Finds a user by their username.
   * @param username - The username to search for.
   * @returns A ResultAsync that resolves to the User instance if found, or null if not found and DomainError on error.
   */
  @WithPosition()
  findUserByUsername(username: string): ResultAsync<User | null, DomainError> {
    return this.userCoreRepository.findUserByUsername(username);
  }

  /**
   * Finds a user by their email address.
   * @param email - The email address to search for.
   * @returns A ResultAsync that resolves to the User instance if found, or null if not found and DomainError on error.
   */
  @WithPosition()
  findUserByEmail(email: string): ResultAsync<User | null, DomainError> {
    return this.userCoreRepository.findUserByEmail(email);
  }

  //================================================== USER PROFILE ==================================================
  /**
   * Gets the current authenticated user from ALS (AsyncLocalStorage).
   * This method requires AuthGuard to be used on the route to set userId in ALS.
   * @returns A ResultAsync that resolves to the User instance or DomainError on error.
   */
  @WithPosition()
  getCurrentUser(): ResultAsync<User, DomainError> {
    // Get userId from ALS (set by AuthGuard)
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

    // Find user by ID
    return this.userCoreRepository.findUserById(userId).andThen((user) => {
      // If user not found (deleted or doesn't exist), return error
      if (!user) {
        return errAsync(
          createDomainError(SHARED_ERRORS.SYSTEM_ERROR, {
            cause: SHARED_ERRORS.SYSTEM_ERROR.message,
          }),
        );
      }

      return okAsync(user);
    });
  }

  /**
   * Updates the current user's profile.
   * Checks if DTO is empty first - if all fields are undefined, returns success immediately.
   * Otherwise, fetches user, applies changes, and saves.
   * @param dto - UpdateProfileArgumentDto with optional fields
   * @returns A ResultAsync that resolves to void on success or DomainError on error.
   */
  @WithPosition()
  updateProfile(dto: UpdateProfileArgumentDto): ResultAsync<void, DomainError> {
    // Check if DTO is empty (all fields undefined) - return success immediately
    const isDtoEmpty =
      dto.fullName === undefined &&
      dto.dateOfBirth === undefined &&
      dto.gender === undefined &&
      dto.email === undefined;

    if (isDtoEmpty) {
      return okAsync(undefined);
    }

    // DTO has data - get current user and apply changes
    return this.getCurrentUser().andThen(
      (user): ResultAsync<void, DomainError> => {
        // Apply fullName if provided
        if (dto.fullName !== undefined) {
          user.changeFullName(dto.fullName);
        }

        // Apply dateOfBirth if provided (returns Result - need to handle error)
        if (dto.dateOfBirth !== undefined) {
          const dateOfBirthResult = user.changeDateOfBirth(dto.dateOfBirth);
          if (dateOfBirthResult.isErr()) {
            return errAsync(dateOfBirthResult.error);
          }
        }

        // Apply gender if provided (returns Result - need to handle error)
        if (dto.gender !== undefined) {
          const genderResult = user.changeGender(dto.gender);
          if (genderResult.isErr()) {
            return errAsync(genderResult.error);
          }
        }

        // Apply email if provided - check for duplicates first
        if (dto.email !== undefined) {
          return this.userCoreRepository
            .findUserByEmail(dto.email)
            .andThen((existingUser) => {
              // If email belongs to another user, reject
              if (existingUser && existingUser.id !== user.id) {
                return errAsync(
                  createDomainError(USER_ERRORS.EMAIL_ALREADY_IN_USE, {
                    cause: USER_ERRORS.EMAIL_ALREADY_IN_USE.message,
                  }),
                );
              }

              // Apply email change
              user.changeEmail(dto.email!);

              // Save user and return void
              return this.userCoreRepository
                .updateUser(user)
                .map(() => undefined);
            });
        }

        // Save user and return void
        return this.userCoreRepository.updateUser(user).map(() => undefined);
      },
    );
  }

  /**
   * Updates the current user's phone number using Firebase OTP verification.
   * Flow:
   * 1. Get userId from ALS
   * 2. Verify Firebase token and extract phone
   * 3. Validate phone format (+84 only)
   * 4. Check phone not already in use by another user
   * 5. Get current user from database
   * 6. Update phone in user domain model
   * 7. Save user to database
   * @param token - Firebase ID token from OTP verification
   * @returns ResultAsync that resolves to void on success or DomainError on error.
   */
  @WithPosition()
  updatePhoneWithOtp(token: string): ResultAsync<void, DomainError> {
    // Step 1: Get current userId from ALS (set by AuthGuard)
    const store = this.als.getStore();
    const userId = store?.userId;

    if (!userId) {
      return errAsync(
        createDomainError(SHARED_ERRORS.SYSTEM_ERROR, {
          cause: SHARED_ERRORS.SYSTEM_ERROR.message,
        }),
      );
    }

    // Step 2: Verify Firebase token and get phone
    return this.externalTokenVerificationService
      .verifyTokenForPhone(token)
      .andThen(({ phone }): ResultAsync<string, DomainError> => {
        // Step 3: Validate phone format (must be +84 followed by 9 digits)
        // Note: phone is already trimmed in Firebase service
        const trimmedPhone = phone.trim();

        if (!isValidVietnamesePhone(trimmedPhone)) {
          return errAsync(
            createDomainError(USER_ERRORS.PHONE_NOT_CORRECT, {
              cause: USER_ERRORS.PHONE_NOT_CORRECT.message,
            }),
          );
        }

        return okAsync(trimmedPhone);
      })
      .andThen(
        (
          trimmedPhone,
        ): ResultAsync<
          { phone: string; existingUser: User | null },
          DomainError
        > => {
          // Step 4: Check if phone already used by another user
          return this.userCoreRepository
            .findUserByPhone(trimmedPhone)
            .map((existingUser) => ({ phone: trimmedPhone, existingUser }));
        },
      )
      .andThen(
        ({
          phone: trimmedPhone,
          existingUser,
        }): ResultAsync<string, DomainError> => {
          // Step 5: Reject if phone belongs to another user (not current user)
          if (existingUser && existingUser.id !== userId) {
            return errAsync(
              createDomainError(USER_ERRORS.PHONE_ALREADY_IN_USE, {
                cause: USER_ERRORS.PHONE_ALREADY_IN_USE.message,
              }),
            );
          }

          return okAsync(trimmedPhone);
        },
      )
      .andThen(
        (
          trimmedPhone,
        ): ResultAsync<{ phone: string; user: User }, DomainError> => {
          // Step 6: Get current user from database
          return this.userCoreRepository
            .findUserById(userId)
            .andThen((user) => {
              if (!user) {
                return errAsync(
                  createDomainError(SHARED_ERRORS.SYSTEM_ERROR, {
                    cause: SHARED_ERRORS.SYSTEM_ERROR.message,
                  }),
                );
              }
              return okAsync({ phone: trimmedPhone, user });
            });
        },
      )
      .andThen(
        ({ phone: trimmedPhone, user }): ResultAsync<User, DomainError> => {
          // Step 7: Update phone in user domain model
          user.changePhoneNumber(trimmedPhone);
          return okAsync(user);
        },
      )
      .andThen((user): ResultAsync<void, DomainError> => {
        // Step 8: Save user to database
        return this.userCoreRepository.updateUser(user).map(() => undefined);
      });
  }

  /**
   * Sets phone number for the current user directly (without OTP verification).
   * Used by other services (e.g., shop registration) that have already verified the phone.
   * Flow:
   * 1. Get userId from ALS
   * 2. Validate phone format (+84 only)
   * 3. Check phone not already in use by another user
   * 4. Get current user from database
   * 5. Update phone in user domain model
   * 6. Save user to database
   * @param phone - The verified phone number to set
   * @returns ResultAsync that resolves to void on success or DomainError on error.
   */
  @WithPosition()
  setPhoneForCurrentUser(phone: string): ResultAsync<void, DomainError> {
    // Step 1: Get current userId from ALS (set by AuthGuard)
    const store = this.als.getStore();
    const userId = store?.userId;

    if (!userId) {
      return errAsync(
        createDomainError(SHARED_ERRORS.SYSTEM_ERROR, {
          cause: SHARED_ERRORS.SYSTEM_ERROR.message,
        }),
      );
    }

    // Step 2: Validate phone format (must be +84 followed by 9 digits)
    const trimmedPhone = phone.trim();

    if (!isValidVietnamesePhone(trimmedPhone)) {
      return errAsync(
        createDomainError(USER_ERRORS.PHONE_NOT_CORRECT, {
          cause: USER_ERRORS.PHONE_NOT_CORRECT.message,
        }),
      );
    }

    // Step 3: Check if phone already used by another user
    return this.userCoreRepository
      .findUserByPhone(trimmedPhone)
      .andThen(
        (
          existingUser,
        ): ResultAsync<
          { phone: string; existingUser: User | null },
          DomainError
        > => {
          return okAsync({ phone: trimmedPhone, existingUser });
        },
      )
      .andThen(
        ({
          phone: trimmedPhone,
          existingUser,
        }): ResultAsync<string, DomainError> => {
          // Step 4: Reject if phone belongs to another user (not current user)
          if (existingUser && existingUser.id !== userId) {
            return errAsync(
              createDomainError(USER_ERRORS.PHONE_ALREADY_IN_USE, {
                cause: USER_ERRORS.PHONE_ALREADY_IN_USE.message,
              }),
            );
          }

          return okAsync(trimmedPhone);
        },
      )
      .andThen(
        (
          trimmedPhone,
        ): ResultAsync<{ phone: string; user: User }, DomainError> => {
          // Step 5: Get current user from database
          return this.userCoreRepository
            .findUserById(userId)
            .andThen((user) => {
              if (!user) {
                return errAsync(
                  createDomainError(SHARED_ERRORS.SYSTEM_ERROR, {
                    cause: SHARED_ERRORS.SYSTEM_ERROR.message,
                  }),
                );
              }
              return okAsync({ phone: trimmedPhone, user });
            });
        },
      )
      .andThen(
        ({ phone: trimmedPhone, user }): ResultAsync<User, DomainError> => {
          // Step 6: Update phone in user domain model
          user.changePhoneNumber(trimmedPhone);
          return okAsync(user);
        },
      )
      .andThen((user): ResultAsync<void, DomainError> => {
        // Step 7: Save user to database
        return this.userCoreRepository.updateUser(user).map(() => undefined);
      });
  }

  //================================================== USER'S ADDRESS ==================================================

  /**
   * Helper method to get location names for an address.
   * Used by controller to construct response DTOs.
   * @param address - The UserAddress to get location names for
   * @returns ResultAsync with location names or error
   */
  @WithPosition()
  getLocationNamesForAddress(
    address: UserAddress,
  ): ResultAsync<
    { wardName: string; districtName: string; provinceName: string },
    DomainError
  > {
    return this.locationService.getLocationNames(
      address.provinceId,
      address.districtId,
      address.wardId,
    );
  }
  /**
   * Gets all addresses for the current authenticated user with location names.
   * Fetches location names for each address.
   * Requires AuthGuard to set userId in ALS.
   */
  @WithPosition()
  getAllAddresses(): ResultAsync<AddressWithLocationNames[], DomainError> {
    const store = this.als.getStore();
    const userId = store?.userId;

    if (!userId) {
      return errAsync(
        createDomainError(SHARED_ERRORS.SYSTEM_ERROR, {
          cause: SHARED_ERRORS.SYSTEM_ERROR.message,
        }),
      );
    }

    return this.userAddressRepository
      .findAllByUserId(userId)
      .andThen((addresses) => {
        // Map each address to ResultAsync<AddressWithLocationNames>
        const addressWithLocationResults = addresses.map((address) =>
          this.getLocationNamesForAddress(address).map((locationNames) => ({
            address,
            locationNames,
          })),
        );

        // Combine all - if ANY fails, entire operation fails
        return ResultAsync.combine(addressWithLocationResults);
      });
  }

  /**
   * Gets a specific address by ID for the current user.
   * Verifies the address belongs to the current user.
   */
  @WithPosition()
  getAddressById(addressId: string): ResultAsync<UserAddress, DomainError> {
    const store = this.als.getStore();
    const userId = store?.userId;

    if (!userId) {
      return errAsync(
        createDomainError(SHARED_ERRORS.SYSTEM_ERROR, {
          cause: SHARED_ERRORS.SYSTEM_ERROR.message,
        }),
      );
    }

    return this.userAddressRepository.findById(addressId).andThen((address) => {
      if (!address) {
        return errAsync(
          createDomainError(USER_ERRORS.ADDRESS_NOT_FOUND, {
            cause: USER_ERRORS.ADDRESS_NOT_FOUND.message,
          }),
        );
      }

      if (!address.belongsToUser(userId)) {
        return errAsync(
          createDomainError(USER_ERRORS.ADDRESS_NOT_OWNED_BY_USER, {
            cause: USER_ERRORS.ADDRESS_NOT_OWNED_BY_USER.message,
          }),
        );
      }

      return okAsync(address);
    });
  }

  /**
   * Creates a new address for the current user with location names.
   * Business logic:
   * - Validates phone format
   * - Validates location hierarchy
   * - If user has no addresses, forces isDefault=true
   * - If isDefault=true and user has addresses, unsets other defaults first (transaction)
   * - Fetches location names for the created address
   */
  @WithPosition()
  createAddress(
    dto: CreateAddressArgumentDto,
  ): ResultAsync<AddressWithLocationNames, DomainError> {
    const store = this.als.getStore();
    const userId = store?.userId;

    if (!userId) {
      return errAsync(
        createDomainError(SHARED_ERRORS.SYSTEM_ERROR, {
          cause: SHARED_ERRORS.SYSTEM_ERROR.message,
        }),
      );
    }

    // Step 1: Validate location hierarchy
    return this.locationService
      .validateLocation(dto.provinceId, dto.districtId, dto.wardId)
      .andThen((isValid) => {
        if (!isValid) {
          return errAsync(
            createDomainError(USER_ERRORS.INVALID_LOCATION_HIERARCHY, {
              cause: USER_ERRORS.INVALID_LOCATION_HIERARCHY.message,
            }),
          );
        }
        return okAsync(undefined);
      })
      .andThen(() => {
        // Step 2: Count existing addresses to determine if this is first address
        return this.userAddressRepository.countByUserId(userId);
      })
      .andThen((addressCount) => {
        // Step 3: Check if user has reached maximum addresses limit
        if (addressCount >= MAX_ADDRESSES_PER_USER) {
          return errAsync(
            createDomainError(USER_ERRORS.MAX_ADDRESSES_REACHED, {
              cause: USER_ERRORS.MAX_ADDRESSES_REACHED.message,
            }),
          );
        }

        // Step 4: Force isDefault=true if this is the first address
        const isFirstAddress = addressCount === 0;
        const shouldBeDefault = isFirstAddress || dto.isDefault === true;

        // Step 5: Create address domain model
        const newAddress = new UserAddress(
          uuidv7(),
          userId,
          dto.label || 'HOME',
          dto.recipientName,
          dto.recipientPhone,
          dto.addressLine,
          dto.wardId,
          dto.districtId,
          dto.provinceId,
          dto.latitude || null,
          dto.longitude || null,
          shouldBeDefault,
          new Date(),
          new Date(),
        );

        // Step 6: If setting as default and not first address, use transaction
        const createAddressResult =
          shouldBeDefault && !isFirstAddress
            ? this.transactionUow.executeInTransaction(() =>
                this.userAddressRepository
                  .unsetAllDefaults(userId)
                  .andThen(() =>
                    this.userAddressRepository.createAddress(newAddress),
                  ),
              )
            : this.userAddressRepository.createAddress(newAddress);

        // Step 7: Fetch location names for the created address
        return createAddressResult.andThen((address) =>
          this.getLocationNamesForAddress(address).map((locationNames) => ({
            address,
            locationNames,
          })),
        );
      });
  }

  /**
   * Updates an existing address with location names.
   * Business logic:
   * - Verifies address exists and belongs to current user
   * - Validates location if changed
   * - If setting isDefault=true, unsets other defaults first (transaction)
   * - Fetches location names for the updated address
   */
  @WithPosition()
  updateAddress(
    addressId: string,
    dto: UpdateAddressArgumentDto,
  ): ResultAsync<AddressWithLocationNames, DomainError> {
    const store = this.als.getStore();
    const userId = store?.userId;

    if (!userId) {
      return errAsync(
        createDomainError(SHARED_ERRORS.SYSTEM_ERROR, {
          cause: SHARED_ERRORS.SYSTEM_ERROR.message,
        }),
      );
    }

    // Step 1: Fetch existing address
    return this.userAddressRepository
      .findById(addressId)
      .andThen((existingAddress) => {
        // Step 2: Verify address exists
        if (!existingAddress) {
          return errAsync(
            createDomainError(USER_ERRORS.ADDRESS_NOT_FOUND, {
              cause: USER_ERRORS.ADDRESS_NOT_FOUND.message,
            }),
          );
        }

        // Step 3: Verify ownership
        if (!existingAddress.belongsToUser(userId)) {
          return errAsync(
            createDomainError(USER_ERRORS.ADDRESS_NOT_OWNED_BY_USER, {
              cause: USER_ERRORS.ADDRESS_NOT_OWNED_BY_USER.message,
            }),
          );
        }

        return okAsync(existingAddress);
      })
      .andThen((existingAddress) => {
        // Step 4: Validate location if any location field changed
        const locationChanged =
          dto.provinceId !== undefined ||
          dto.districtId !== undefined ||
          dto.wardId !== undefined;

        if (locationChanged) {
          const provinceId = dto.provinceId || existingAddress.provinceId;
          const districtId = dto.districtId || existingAddress.districtId;
          const wardId = dto.wardId || existingAddress.wardId;

          return this.locationService
            .validateLocation(provinceId, districtId, wardId)
            .andThen((isValid) => {
              if (!isValid) {
                return errAsync(
                  createDomainError(USER_ERRORS.INVALID_LOCATION_HIERARCHY, {
                    cause: USER_ERRORS.INVALID_LOCATION_HIERARCHY.message,
                  }),
                );
              }
              return okAsync(existingAddress);
            });
        }

        return okAsync(existingAddress);
      })
      .andThen((existingAddress) => {
        // Step 5: Build updated address using domain model method
        const updatedAddress = existingAddress.applyUpdates({
          label: dto.label,
          recipientName: dto.recipientName,
          recipientPhone: dto.recipientPhone,
          addressLine: dto.addressLine,
          wardId: dto.wardId,
          districtId: dto.districtId,
          provinceId: dto.provinceId,
          latitude: dto.latitude,
          longitude: dto.longitude,
          isDefault: dto.isDefault,
        });

        // Step 6: If setting as default, unset others first (transaction)
        const isSettingDefault =
          dto.isDefault === true && !existingAddress.isDefault;

        const updateAddressResult = isSettingDefault
          ? this.transactionUow.executeInTransaction(() =>
              this.userAddressRepository
                .unsetAllDefaults(userId)
                .andThen(() =>
                  this.userAddressRepository.updateAddress(updatedAddress),
                ),
            )
          : this.userAddressRepository.updateAddress(updatedAddress);

        // Step 7: Fetch location names for the updated address
        return updateAddressResult.andThen((address) =>
          this.getLocationNamesForAddress(address).map((locationNames) => ({
            address,
            locationNames,
          })),
        );
      });
  }

  /**
   * Deletes an address.
   * Business logic:
   * - Verifies address exists and belongs to current user
   * - If address is default AND user has other addresses: blocks deletion
   * - If address is default AND it's the only address: allows deletion
   * - If address is not default: always allows deletion
   */
  @WithPosition()
  deleteAddress(addressId: string): ResultAsync<void, DomainError> {
    const store = this.als.getStore();
    const userId = store?.userId;

    if (!userId) {
      return errAsync(
        createDomainError(SHARED_ERRORS.SYSTEM_ERROR, {
          cause: SHARED_ERRORS.SYSTEM_ERROR.message,
        }),
      );
    }

    // Step 1: Fetch address
    return this.userAddressRepository
      .findById(addressId)
      .andThen((address) => {
        // Step 2: Verify address exists
        if (!address) {
          return errAsync(
            createDomainError(USER_ERRORS.ADDRESS_NOT_FOUND, {
              cause: USER_ERRORS.ADDRESS_NOT_FOUND.message,
            }),
          );
        }

        // Step 3: Verify ownership
        if (!address.belongsToUser(userId)) {
          return errAsync(
            createDomainError(USER_ERRORS.ADDRESS_NOT_OWNED_BY_USER, {
              cause: USER_ERRORS.ADDRESS_NOT_OWNED_BY_USER.message,
            }),
          );
        }

        return okAsync(address);
      })
      .andThen((address) => {
        // Step 4: If address is default, check if others exist
        if (address.isDefault) {
          return this.userAddressRepository
            .countByUserId(userId)
            .andThen((count) => {
              // Block deletion if other addresses exist
              if (count > 1) {
                return errAsync(
                  createDomainError(USER_ERRORS.CANNOT_DELETE_DEFAULT_ADDRESS, {
                    cause: USER_ERRORS.CANNOT_DELETE_DEFAULT_ADDRESS.message,
                  }),
                );
              }
              return okAsync(address);
            });
        }

        return okAsync(address);
      })
      .andThen(() => {
        // Step 5: Delete the address
        return this.userAddressRepository.deleteAddress(addressId);
      });
  }

  /**
   * Sets an address as the default.
   * Business logic:
   * - Verifies address exists and belongs to current user
   * - Unsets all other defaults for this user (transaction)
   * - Sets this address as default
   */
  @WithPosition()
  setDefaultAddress(addressId: string): ResultAsync<void, DomainError> {
    const store = this.als.getStore();
    const userId = store?.userId;

    if (!userId) {
      return errAsync(
        createDomainError(SHARED_ERRORS.SYSTEM_ERROR, {
          cause: SHARED_ERRORS.SYSTEM_ERROR.message,
        }),
      );
    }

    // Step 1: Fetch address
    return this.userAddressRepository
      .findById(addressId)
      .andThen((address) => {
        // Step 2: Verify address exists
        if (!address) {
          return errAsync(
            createDomainError(USER_ERRORS.ADDRESS_NOT_FOUND, {
              cause: USER_ERRORS.ADDRESS_NOT_FOUND.message,
            }),
          );
        }

        // Step 3: Verify ownership
        if (!address.belongsToUser(userId)) {
          return errAsync(
            createDomainError(USER_ERRORS.ADDRESS_NOT_OWNED_BY_USER, {
              cause: USER_ERRORS.ADDRESS_NOT_OWNED_BY_USER.message,
            }),
          );
        }

        return okAsync(undefined);
      })
      .andThen(() => {
        // Step 4: Unset all defaults and set this one (transaction)
        return this.transactionUow.executeInTransaction(() =>
          this.userAddressRepository
            .unsetAllDefaults(userId)
            .andThen(() => this.userAddressRepository.setAsDefault(addressId)),
        );
      });
  }

  //================================================== USER'S AVATAR ==================================================
  /**
   * Uploads and sets a new avatar for the current user.
   * Flow:
   * 1. Gets current user from ALS
   * 2. Uploads to Cloudinary (Cloudinary handles JPG conversion via upload preset)
   * 3. Updates user's avatarUrl in database
   * 4. Deletes old avatar from Cloudinary (ONLY if it's not the default avatar URL)
   * Note: File validation (size, mimetype, dimensions) is handled by FileValidationPipe.
   * @param file - The uploaded file from multer (guaranteed to exist and be valid by FileValidationPipe)
   * @returns A ResultAsync that resolves to the new avatar URL or DomainError.
   */
  @WithPosition()
  uploadAvatar(file: Express.Multer.File): ResultAsync<string, DomainError> {
    let currentUser: User;
    let oldAvatarUrl: string;
    const defaultAvatarUrl = this.imageProcessingService.getDefaultAvatarUrl();
    const avatarPreset = this.configService.get<string>(
      'CLOUDINARY_AVATAR_PRESET',
    );

    if (!avatarPreset) {
      return errAsync(
        createDomainError(USER_ERRORS.AVATAR_UPLOAD_FAILED, {
          cause: 'Cloudinary avatar preset not configured',
        }),
      );
    }

    return this.getCurrentUser()
      .andThen((user) => {
        currentUser = user;
        oldAvatarUrl = user.avatarUrl;
        return this.imageProcessingService.processAndUploadAvatar(
          file.buffer,
          file.mimetype,
          avatarPreset,
        );
      })
      .andThen((uploadResult) => {
        currentUser.changeAvatarUrl(uploadResult.url);
        return this.userCoreRepository
          .updateUser(currentUser)
          .map(() => uploadResult.url);
      })
      .andThen((newAvatarUrl) => {
        // Delete old avatar if it's not the default (async, non-blocking)
        if (oldAvatarUrl && oldAvatarUrl !== defaultAvatarUrl) {
          const publicId =
            this.imageProcessingService.extractPublicIdFromUrl(oldAvatarUrl);
          if (publicId) {
            // Fire and forget - don't block on deletion
            this.imageProcessingService.deleteImage(publicId);
          }
        }
        return okAsync(newAvatarUrl);
      })
      .mapErr((error) => {
        return createDomainError(USER_ERRORS.AVATAR_UPLOAD_FAILED, {
          cause: error,
        });
      });
  }

  /**
   * Deletes the current user's avatar and reverts to default.
   * Flow:
   * 1. Gets current user from ALS
   * 2. Checks if current avatar is not already the default
   * 3. If not default: extracts public ID and deletes from Cloudinary
   * 4. Sets avatarUrl to default in database
   * @returns A ResultAsync that resolves to the default avatar URL or DomainError.
   */
  @WithPosition()
  deleteAvatar(): ResultAsync<string, DomainError> {
    const defaultAvatarUrl = this.imageProcessingService.getDefaultAvatarUrl();
    let currentUser: User;
    let currentAvatarUrl: string;

    return this.getCurrentUser()
      .andThen((user) => {
        currentUser = user;
        currentAvatarUrl = user.avatarUrl;

        // If already using default, skip deletion
        if (currentAvatarUrl === defaultAvatarUrl) {
          return okAsync(undefined);
        }

        // Delete from Cloudinary if it has a valid public ID
        const publicId =
          this.imageProcessingService.extractPublicIdFromUrl(currentAvatarUrl);
        return publicId
          ? this.imageProcessingService.deleteImage(publicId)
          : okAsync(undefined);
      })
      .andThen(() => {
        currentUser.changeAvatarUrl(defaultAvatarUrl);
        return this.userCoreRepository.updateUser(currentUser);
      })
      .map(() => defaultAvatarUrl)
      .mapErr((error) => {
        return createDomainError(USER_ERRORS.AVATAR_DELETE_FAILED, {
          cause: error,
        });
      });
  }
}

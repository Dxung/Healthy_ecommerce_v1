import type { ResultAsync } from 'neverthrow';
import type { User } from './models/user.model';
import type { UserAddress } from './models/user-address.model';
import type { DomainError } from 'src/shared/types/domain-error.type';
import type {
  UpdateProfileArgumentDto,
  CreateAddressArgumentDto,
  UpdateAddressArgumentDto,
} from './dto';

export type AddressWithLocationNames = {
  address: UserAddress;
  locationNames: {
    wardName: string;
    districtName: string;
    provinceName: string;
  };
};

export interface IUserService {
  //================================================== USER LOOKUP & CREATION ==================================================
  /**
   * Finds a user by their phone number.
   * @param phoneNumber - The phone number to search for.
   * @returns A ResultAsync that resolves to the User instance if found, or null if not found and UserErrorType on error.
   */
  findUserUsingPhoneNumber(
    phoneNumber: string,
  ): ResultAsync<User | null, DomainError>;

  /**
   * Checks if a username is available.
   * @param username - The username to check for availability.
   * @returns A ResultAsync that resolves to true if the username is available, false otherwise, and UserErrorType on error.
   */
  checkUsernameAvailability(
    username: string,
  ): ResultAsync<boolean, DomainError>;

  /**
   * creates a new user when using phone number registration
   * @param phoneNumber Phone number of the new user
   * @param username Username wanted for new user
   * @return ResultAsync that resolves to created User instance if success, otherwise return DomainError
   */
  createNewUserByPhone(
    phoneNumber: string,
    username: string,
  ): ResultAsync<User, DomainError>;

  /**
   * Finds a user by their username.
   * @param username - The username to search for.
   * @returns A ResultAsync that resolves to the User instance if found, or null if not found and DomainError on error.
   */
  findUserByUsername(username: string): ResultAsync<User | null, DomainError>;

  /**
   * Finds a user by their email address.
   * @param email - The email address to search for.
   * @returns A ResultAsync that resolves to the User instance if found, or null if not found and DomainError on error.
   */
  findUserByEmail(email: string): ResultAsync<User | null, DomainError>;

  //================================================== USER PROFILE ==================================================
  /**
   * Gets the current authenticated user from ALS (AsyncLocalStorage).
   * @returns A ResultAsync that resolves to the User instance or DomainError on error.
   */
  getCurrentUser(): ResultAsync<User, DomainError>;

  /**
   * Updates the current user's profile.
   * If DTO is empty, returns success immediately without database access.
   * @param dto - UpdateProfileArgumentDto with optional fields (fullName, dateOfBirth, gender)
   * @returns A ResultAsync that resolves to void on success or DomainError on error.
   */
  updateProfile(dto: UpdateProfileArgumentDto): ResultAsync<void, DomainError>;

  /**
   * Updates the current user's phone number using Firebase OTP verification.
   * Flow:
   * 1. Verify Firebase token and extract phone number
   * 2. Validate phone format (+84 only)
   * 3. Check phone not already in use by another user
   * 4. Update phone for current userId
   * Requires AuthGuard to set userId in ALS.
   * @param token - Firebase ID token from OTP verification.
   * @returns A ResultAsync that resolves to void on success or DomainError on error.
   */
  updatePhoneWithOtp(token: string): ResultAsync<void, DomainError>;

  /**
   * Sets phone number for the current user directly (without OTP verification).
   * Used by other services (e.g., shop registration) that have already verified the phone.
   * Flow:
   * 1. Validate phone format (+84 only)
   * 2. Check phone not already in use by another user
   * 3. Update phone for current userId
   * Requires AuthGuard to set userId in ALS.
   * @param phone - The verified phone number to set.
   * @returns A ResultAsync that resolves to void on success or DomainError on error.
   */
  setPhoneForCurrentUser(phone: string): ResultAsync<void, DomainError>;

  //================================================== USER'S ADDRESS ==================================================
  /**
   * Gets all addresses for the current authenticated user with location names.
   * Returns addresses sorted by isDefault DESC, createdAt DESC.
   * Fetches location names for each address.
   * Requires AuthGuard to set userId in ALS.
   * @returns A ResultAsync that resolves to array of AddressWithLocationNames or DomainError.
   */
  getAllAddresses(): ResultAsync<AddressWithLocationNames[], DomainError>;

  /**
   * Gets a specific address by ID for the current user.
   * Verifies the address belongs to the current user.
   * Requires AuthGuard to set userId in ALS.
   * @param addressId - The address ID.
   * @returns A ResultAsync that resolves to UserAddress or DomainError if not found/not owned.
   */
  getAddressById(addressId: string): ResultAsync<UserAddress, DomainError>;

  /**
   * Creates a new address for the current user with location names.
   * Business logic:
   * - Validates phone format (must be +84xxxxxxxxx)
   * - Validates location hierarchy (province->district->ward)
   * - If user has no addresses, forces isDefault=true
   * - If isDefault=true and user has addresses, unsets other defaults first (transaction)
   * - Fetches location names for the created address
   * Requires AuthGuard to set userId in ALS.
   * @param dto - CreateAddressArgumentDto with address details
   * @returns A ResultAsync that resolves to created AddressWithLocationNames or DomainError.
   */
  createAddress(
    dto: CreateAddressArgumentDto,
  ): ResultAsync<AddressWithLocationNames, DomainError>;

  /**
   * Updates an existing address with location names.
   * Business logic:
   * - Verifies address exists and belongs to current user
   * - Validates phone if changed
   * - Validates location if changed
   * - If setting isDefault=true, unsets other defaults first (transaction)
   * - Fetches location names for the updated address
   * Requires AuthGuard to set userId in ALS.
   * @param addressId - The address ID to update
   * @param dto - UpdateAddressArgumentDto with fields to update
   * @returns A ResultAsync that resolves to updated AddressWithLocationNames or DomainError.
   */
  updateAddress(
    addressId: string,
    dto: UpdateAddressArgumentDto,
  ): ResultAsync<AddressWithLocationNames, DomainError>;

  /**
   * Deletes an address.
   * Business logic:
   * - Verifies address exists and belongs to current user
   * - If address is default AND user has other addresses: blocks deletion
   * - If address is default AND it's the only address: allows deletion
   * - If address is not default: always allows deletion
   * Requires AuthGuard to set userId in ALS.
   * @param addressId - The address ID to delete
   * @returns A ResultAsync that resolves to void or DomainError.
   */
  deleteAddress(addressId: string): ResultAsync<void, DomainError>;

  /**
   * Sets an address as the default.
   * Business logic:
   * - Verifies address exists and belongs to current user
   * - Unsets all other defaults for this user (transaction)
   * - Sets this address as default
   * Requires AuthGuard to set userId in ALS.
   * @param addressId - The address ID to set as default
   * @returns A ResultAsync that resolves to void or DomainError.
   */
  setDefaultAddress(addressId: string): ResultAsync<void, DomainError>;

  /**
   * Gets location names for an address.
   * Fetches province, district, and ward names for the address.
   * Uses efficient JOIN query to fetch all names in a single database call.
   * @param address - The UserAddress to get location names for
   * @returns A ResultAsync with location names object or DomainError.
   */
  getLocationNamesForAddress(
    address: UserAddress,
  ): ResultAsync<
    { provinceName: string; districtName: string; wardName: string },
    DomainError
  >;

  //================================================== USER'S AVATAR ==================================================
  /**
   * Uploads and sets a new avatar for the current user.
   * Flow:
   * 1. Uploads to Cloudinary (Cloudinary handles JPG conversion via upload preset)
   * 2. Updates user's avatarUrl in database
   * 3. Deletes old avatar from Cloudinary ONLY if it's not the default avatar URL
   * Note: File validation (size, mimetype, dimensions) is handled by FileValidationPipe.
   * Requires AuthGuard to set userId in ALS.
   * @param file - The uploaded file from multer (guaranteed to exist and be valid by FileValidationPipe)
   * @returns A ResultAsync that resolves to the new avatar URL or DomainError.
   */
  uploadAvatar(file: Express.Multer.File): ResultAsync<string, DomainError>;

  /**
   * Deletes the current user's avatar and reverts to default.
   * Flow:
   * 1. Gets current user from ALS
   * 2. Checks if current avatar is not already the default
   * 3. If not default: extracts public ID and deletes from Cloudinary
   * 4. Sets avatarUrl to default in database
   * Requires AuthGuard to set userId in ALS.
   * @returns A ResultAsync that resolves to the default avatar URL or DomainError.
   */
  deleteAvatar(): ResultAsync<string, DomainError>;
}

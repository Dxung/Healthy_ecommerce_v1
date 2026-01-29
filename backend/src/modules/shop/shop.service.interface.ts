import type { ResultAsync } from 'neverthrow';
import type { DomainError } from 'src/shared/types/domain-error.type';
import type { ShopRegistrationRequest } from './models/shop-registration-request.model';
import type { Shop } from './models/shop.model';
import type { ShopRegistrationStatus } from 'src/database/typeorm/entities/shop/enums/shop-registration-status.enum';
import type {
  ApproveRegistrationArgumentDto,
  InitShopRegistrationArgumentDto,
  CompleteShopRegistrationArgumentDto,
} from './dto';

export type RegistrationWithLocationNames = {
  registration: ShopRegistrationRequest;
  locationNames: {
    wardName: string;
    districtName: string;
    provinceName: string;
  };
};

export interface IShopService {
  //================================================== BUYER REGISTRATION (2-PHASE) ==================================================

  /**
   * Phase 1: Initializes shop registration.
   * Phone verification flow:
   * - If user already has phone + token provided → REJECT (bypass attempt)
   * - If user already has phone + no token → verify dto.phone matches user's phone
   * - If user has no phone + token provided → verify token, update user's phone
   * - If user has no phone + no token → ERROR (phone verification required)
   * Business logic:
   * - Validates location hierarchy (province->district->ward)
   * - Checks shop name uniqueness
   * - Checks user doesn't already have a pending registration
   * - Auto-generates slug from shop name
   * - Creates and returns internal token (valid for 30 minutes)
   * Requires AuthGuard to set userId in ALS.
   * @param dto - InitShopRegistrationArgumentDto with basic shop info and optional Firebase OTP token
   * @returns A ResultAsync that resolves to { token: string } or DomainError.
   */
  initRegistration(
    dto: InitShopRegistrationArgumentDto,
  ): ResultAsync<{ token: string }, DomainError>;

  /**
   * Phase 2: Completes shop registration with documents.
   * Business logic:
   * - Verifies internal token and retrieves stored data
   * - Validates documents if badge is requested
   * - Creates ShopRegistrationRequest in database
   * Requires AuthGuard to set userId in ALS.
   * @param dto - CompleteShopRegistrationArgumentDto with token and optional documents
   * @returns A ResultAsync that resolves to the created ShopRegistrationRequest or DomainError.
   */
  completeRegistration(
    dto: CompleteShopRegistrationArgumentDto,
  ): ResultAsync<ShopRegistrationRequest, DomainError>;

  /**
   * Gets the current user's most recent registration request.
   * Returns the latest registration regardless of status.
   * Requires AuthGuard to set userId in ALS.
   * @returns A ResultAsync that resolves to ShopRegistrationRequest or null if none exists.
   */
  getMyRegistration(): ResultAsync<ShopRegistrationRequest | null, DomainError>;

  /**
   * Gets the current user's shop.
   * Returns null if user doesn't own a shop.
   * Requires AuthGuard to set userId in ALS.
   * @returns A ResultAsync that resolves to Shop or null if none exists.
   */
  getMyShop(): ResultAsync<Shop | null, DomainError>;

  //================================================== ADMIN REGISTRATION MANAGEMENT ==================================================

  /**
   * Gets all registration requests with optional status filter.
   * For admin use only.
   * @param status - Optional status filter (pending, approved, rejected)
   * @returns A ResultAsync that resolves to array of ShopRegistrationRequest.
   */
  getRegistrations(
    status?: ShopRegistrationStatus,
  ): ResultAsync<ShopRegistrationRequest[], DomainError>;

  /**
   * Gets a registration request by ID with location names.
   * For admin use only.
   * @param id - The registration ID
   * @returns A ResultAsync that resolves to RegistrationWithLocationNames or DomainError if not found.
   */
  getRegistrationById(
    id: string,
  ): ResultAsync<RegistrationWithLocationNames, DomainError>;

  /**
   * Approves a registration request.
   * Business logic:
   * - Validates registration exists and is pending
   * - Checks user doesn't already own a shop
   * - Creates shop from registration data
   * - Assigns shop role to user
   * - Optionally grants badge based on dto options
   * - Updates registration status to approved
   * Requires AuthGuard to set adminId in ALS.
   * @param id - The registration ID to approve
   * @param dto - ApproveRegistrationArgumentDto with approval options
   * @returns A ResultAsync that resolves to the created Shop or DomainError.
   */
  approveRegistration(
    id: string,
    dto: ApproveRegistrationArgumentDto,
  ): ResultAsync<Shop, DomainError>;

  /**
   * Rejects a registration request.
   * Business logic:
   * - Validates registration exists and is pending
   * - Updates registration status to rejected with reason
   * Requires AuthGuard to set adminId in ALS.
   * @param id - The registration ID to reject
   * @param reason - The rejection reason
   * @returns A ResultAsync that resolves to void or DomainError.
   */
  rejectRegistration(
    id: string,
    reason: string,
  ): ResultAsync<void, DomainError>;
}

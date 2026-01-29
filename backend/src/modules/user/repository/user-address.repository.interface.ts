import type { ResultAsync } from 'neverthrow';
import type { UserAddress } from '../models/user-address.model';
import type { DomainError } from 'src/shared/types/domain-error.type';

export interface IUserAddressRepository {
  /**
   * Finds all addresses for a specific user
   * Sorted by is_default DESC, created_at DESC
   * @param userId - The user ID
   * @returns Array of UserAddress models or error
   */
  findAllByUserId(userId: string): ResultAsync<UserAddress[], DomainError>;

  /**
   * Finds a specific address by ID
   * @param addressId - The address ID
   * @returns UserAddress model or null if not found, or error
   */
  findById(addressId: string): ResultAsync<UserAddress | null, DomainError>;

  /**
   * Creates a new address
   * @param address - The UserAddress domain model to create
   * @returns Created UserAddress or error
   */
  createAddress(address: UserAddress): ResultAsync<UserAddress, DomainError>;

  /**
   * Updates an existing address
   * @param address - The UserAddress domain model with updated data
   * @returns Updated UserAddress or error
   */
  updateAddress(address: UserAddress): ResultAsync<UserAddress, DomainError>;

  /**
   * Deletes an address
   * @param addressId - The address ID to delete
   * @returns Void on success or error
   */
  deleteAddress(addressId: string): ResultAsync<void, DomainError>;

  /**
   * Unsets all default addresses for a user
   * Used in transactions when setting a new default
   * @param userId - The user ID
   * @returns Void on success or error
   */
  unsetAllDefaults(userId: string): ResultAsync<void, DomainError>;

  /**
   * Counts addresses for a user
   * @param userId - The user ID
   * @returns Count of addresses or error
   */
  countByUserId(userId: string): ResultAsync<number, DomainError>;

  /**
   * Finds the default address for a user
   * @param userId - The user ID
   * @returns UserAddress model or null if no default, or error
   */
  findDefaultByUserId(
    userId: string,
  ): ResultAsync<UserAddress | null, DomainError>;

  /**
   * Sets a specific address as default
   * @param addressId - The address ID to set as default
   * @returns Void on success or error
   */
  setAsDefault(addressId: string): ResultAsync<void, DomainError>;
}

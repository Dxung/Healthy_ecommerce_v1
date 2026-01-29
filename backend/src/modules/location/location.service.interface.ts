import type { ResultAsync } from 'neverthrow';
import type { Province } from './models/province.model';
import type { District } from './models/district.model';
import type { Ward } from './models/ward.model';
import type { DomainError } from 'src/shared/types/domain-error.type';

export interface ILocationService {
  /**
   * Gets all provinces in Vietnam.
   * @returns Array of Province models or error
   */
  getAllProvinces(): ResultAsync<Province[], DomainError>;

  /**
   * Gets districts by province ID.
   * @param provinceId - The province ID
   * @returns Array of District models or error
   */
  getDistrictsByProvince(
    provinceId: string,
  ): ResultAsync<District[], DomainError>;

  /**
   * Gets wards by district ID.
   * @param districtId - The district ID
   * @returns Array of Ward models or error
   */
  getWardsByDistrict(districtId: string): ResultAsync<Ward[], DomainError>;

  /**
   * Validates that a location combination (province, district, ward) exists and is valid.
   * @param provinceId - The province ID
   * @param districtId - The district ID
   * @param wardId - The ward ID
   * @returns True if valid, error otherwise
   */
  validateLocation(
    provinceId: string,
    districtId: string,
    wardId: string,
  ): ResultAsync<boolean, DomainError>;

  /**
   * Gets location names (province, district, ward) by their IDs.
   * @param provinceId - The province ID
   * @param districtId - The district ID
   * @param wardId - The ward ID
   * @returns Object containing location names or error
   */
  getLocationNames(
    provinceId: string,
    districtId: string,
    wardId: string,
  ): ResultAsync<
    { provinceName: string; districtName: string; wardName: string },
    DomainError
  >;
}

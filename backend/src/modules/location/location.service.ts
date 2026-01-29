import { Inject, Injectable } from '@nestjs/common';
import { ResultAsync } from 'neverthrow';
import { ILocationService } from './location.service.interface';
import { ILocationRepository } from './repository/location.repository.interface';
import { Province } from './models/province.model';
import { District } from './models/district.model';
import { Ward } from './models/ward.model';
import { DomainError } from 'src/shared/types/domain-error.type';
import { LOCATION_REPOSITORY } from 'src/database/typeorm/tokens/database.token';
import { WithPosition } from 'src/common/decorators/with-position.decorator';

@Injectable()
export class LocationService implements ILocationService {
  constructor(
    @Inject(LOCATION_REPOSITORY)
    private readonly locationRepository: ILocationRepository,
  ) {}

  @WithPosition()
  getAllProvinces(): ResultAsync<Province[], DomainError> {
    return this.locationRepository.getAllProvinces();
  }

  @WithPosition()
  getDistrictsByProvince(
    provinceId: string,
  ): ResultAsync<District[], DomainError> {
    return this.locationRepository.getDistrictsByProvinceId(provinceId);
  }

  @WithPosition()
  getWardsByDistrict(districtId: string): ResultAsync<Ward[], DomainError> {
    return this.locationRepository.getWardsByDistrictId(districtId);
  }

  @WithPosition()
  validateLocation(
    provinceId: string,
    districtId: string,
    wardId: string,
  ): ResultAsync<boolean, DomainError> {
    return this.locationRepository.validateLocation(
      provinceId,
      districtId,
      wardId,
    );
  }

  @WithPosition()
  getLocationNames(
    provinceId: string,
    districtId: string,
    wardId: string,
  ): ResultAsync<
    { provinceName: string; districtName: string; wardName: string },
    DomainError
  > {
    return this.locationRepository.getLocationNames(
      provinceId,
      districtId,
      wardId,
    );
  }
}

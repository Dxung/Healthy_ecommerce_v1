import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ResultAsync, okAsync, errAsync } from 'neverthrow';
import { AsyncLocalStorage } from 'async_hooks';
import { ILocationRepository } from 'src/modules/location/repository/location.repository.interface';
import { Province } from 'src/modules/location/models/province.model';
import { District } from 'src/modules/location/models/district.model';
import { Ward } from 'src/modules/location/models/ward.model';
import { ORMProvince } from '../../entities/location/orm.province.entity';
import { ORMDistrict } from '../../entities/location/orm.district.entity';
import { ORMWard } from '../../entities/location/orm.ward.entity';
import { ORMLocationMapper } from '../../mappers/location.mapper.orm';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { SHARED_ERRORS } from 'src/shared/errors/shared.errors';
import { LOCATION_ERRORS } from 'src/modules/location/errors/location.errors';
import { ITypeORMAlsStore } from 'src/shared/als/interfaces/als-store.interface';

@Injectable()
export class OrmLocationRepository implements ILocationRepository {
  constructor(
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
    private readonly dataSource: DataSource,
  ) {}

  @WithPosition()
  getAllProvinces(): ResultAsync<Province[], DomainError> {
    const repo = this.getProvinceRepository();
    return ResultAsync.fromPromise(
      repo.find({ order: { name: 'ASC' } }),
      (error) => {
        return createDomainError(SHARED_ERRORS.DB_ERROR, {
          cause: error,
        });
      },
    ).map((ormProvinces) =>
      ORMLocationMapper.provinceToDomainList(ormProvinces),
    );
  }

  @WithPosition()
  getDistrictsByProvinceId(
    provinceId: string,
  ): ResultAsync<District[], DomainError> {
    const repo = this.getDistrictRepository();
    return ResultAsync.fromPromise(
      repo.find({
        where: { provinceId },
        order: { name: 'ASC' },
      }),
      (error) => {
        return createDomainError(SHARED_ERRORS.DB_ERROR, {
          cause: error,
        });
      },
    ).map((ormDistricts) =>
      ORMLocationMapper.districtToDomainList(ormDistricts),
    );
  }

  @WithPosition()
  getWardsByDistrictId(districtId: string): ResultAsync<Ward[], DomainError> {
    const repo = this.getWardRepository();
    return ResultAsync.fromPromise(
      repo.find({
        where: { districtId },
        order: { name: 'ASC' },
      }),
      (error) => {
        return createDomainError(SHARED_ERRORS.DB_ERROR, {
          cause: error,
        });
      },
    ).map((ormWards) => ORMLocationMapper.wardToDomainList(ormWards));
  }

  @WithPosition()
  validateLocation(
    provinceId: string,
    districtId: string,
    wardId: string,
  ): ResultAsync<boolean, DomainError> {
    const wardRepo = this.getWardRepository();

    return ResultAsync.fromPromise(
      wardRepo.findOne({
        where: { id: wardId },
        relations: ['district', 'district.province'],
      }),
      (error) => {
        return createDomainError(SHARED_ERRORS.DB_ERROR, {
          cause: error,
        });
      },
    ).map((ward) => {
      if (!ward) return false;
      if (ward.districtId !== districtId) return false;
      if (ward.district.provinceId !== provinceId) return false;
      return true;
    });
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
    const wardRepo = this.getWardRepository();

    return ResultAsync.fromPromise(
      wardRepo.findOne({
        where: { id: wardId },
        relations: ['district', 'district.province'],
      }),
      (error) => {
        return createDomainError(SHARED_ERRORS.DB_ERROR, {
          cause: error,
        });
      },
    ).andThen((ward) => {
      if (!ward) {
        return errAsync(
          createDomainError(LOCATION_ERRORS.WARD_NOT_FOUND, {
            cause: LOCATION_ERRORS.WARD_NOT_FOUND.message,
          }),
        );
      }

      return okAsync({
        wardName: ward.nameWithType || ward.name,
        districtName: ward.district.nameWithType || ward.district.name,
        provinceName:
          ward.district.province.nameWithType || ward.district.province.name,
      });
    });
  }

  private getEntityManager() {
    const store = this.als.getStore();
    if (!store || !store.ctx) return null;
    return store.ctx;
  }

  private getProvinceRepository() {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return em.getRepository(ORMProvince);
  }

  private getDistrictRepository() {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return em.getRepository(ORMDistrict);
  }

  private getWardRepository() {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return em.getRepository(ORMWard);
  }
}

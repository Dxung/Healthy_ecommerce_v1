import { ORMProvince } from '../entities/location/orm.province.entity';
import { ORMDistrict } from '../entities/location/orm.district.entity';
import { ORMWard } from '../entities/location/orm.ward.entity';
import { Province } from 'src/modules/location/models/province.model';
import { District } from 'src/modules/location/models/district.model';
import { Ward } from 'src/modules/location/models/ward.model';

/**
 * Mapper for converting between ORM entities and domain models for locations
 */
export class ORMLocationMapper {
  /**
   * Convert ORM Province entity to Province domain model
   */
  static provinceToDomain(ormProvince: ORMProvince): Province {
    return new Province(
      ormProvince.id,
      ormProvince.name,
      ormProvince.nameEn,
      ormProvince.type,
      ormProvince.nameWithType,
    );
  }

  /**
   * Convert array of ORM Province entities to array of Province domain models
   */
  static provinceToDomainList(ormProvinces: ORMProvince[]): Province[] {
    return ormProvinces.map((province) =>
      ORMLocationMapper.provinceToDomain(province),
    );
  }

  /**
   * Convert ORM District entity to District domain model
   */
  static districtToDomain(ormDistrict: ORMDistrict): District {
    return new District(
      ormDistrict.id,
      ormDistrict.provinceId,
      ormDistrict.name,
      ormDistrict.nameEn,
      ormDistrict.type,
      ormDistrict.nameWithType,
    );
  }

  /**
   * Convert array of ORM District entities to array of District domain models
   */
  static districtToDomainList(ormDistricts: ORMDistrict[]): District[] {
    return ormDistricts.map((district) =>
      ORMLocationMapper.districtToDomain(district),
    );
  }

  /**
   * Convert ORM Ward entity to Ward domain model
   */
  static wardToDomain(ormWard: ORMWard): Ward {
    return new Ward(
      ormWard.id,
      ormWard.districtId,
      ormWard.name,
      ormWard.nameEn,
      ormWard.type,
      ormWard.nameWithType,
    );
  }

  /**
   * Convert array of ORM Ward entities to array of Ward domain models
   */
  static wardToDomainList(ormWards: ORMWard[]): Ward[] {
    return ormWards.map((ward) => ORMLocationMapper.wardToDomain(ward));
  }
}

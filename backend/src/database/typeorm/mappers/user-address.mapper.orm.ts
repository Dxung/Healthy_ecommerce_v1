import { ORMUserAddress } from '../entities/user/orm.user-address.entity';
import { UserAddress } from 'src/modules/user/models/user-address.model';

/**
 * Mapper for converting between ORM entities and domain models for user addresses
 */
export class ORMUserAddressMapper {
  /**
   * Convert ORM UserAddress entity to UserAddress domain model
   */
  static toDomain(ormAddress: ORMUserAddress): UserAddress {
    return new UserAddress(
      ormAddress.id,
      ormAddress.userId,
      ormAddress.label,
      ormAddress.recipientName,
      ormAddress.recipientPhone,
      ormAddress.addressLine,
      ormAddress.wardId,
      ormAddress.districtId,
      ormAddress.provinceId,
      ormAddress.latitude,
      ormAddress.longitude,
      ormAddress.isDefault,
      ormAddress.createdAt,
      ormAddress.updatedAt,
    );
  }

  /**
   * Convert UserAddress domain model to ORM entity
   */
  static toOrm(domainAddress: UserAddress): ORMUserAddress {
    const ormAddress = new ORMUserAddress();
    ormAddress.id = domainAddress.id;
    ormAddress.userId = domainAddress.userId;
    ormAddress.label = domainAddress.label;
    ormAddress.recipientName = domainAddress.recipientName;
    ormAddress.recipientPhone = domainAddress.recipientPhone;
    ormAddress.addressLine = domainAddress.addressLine;
    ormAddress.wardId = domainAddress.wardId;
    ormAddress.districtId = domainAddress.districtId;
    ormAddress.provinceId = domainAddress.provinceId;
    ormAddress.latitude = domainAddress.latitude;
    ormAddress.longitude = domainAddress.longitude;
    ormAddress.isDefault = domainAddress.isDefault;
    ormAddress.createdAt = domainAddress.createdAt;
    ormAddress.updatedAt = domainAddress.updatedAt;
    return ormAddress;
  }

  /**
   * Convert array of ORM entities to array of domain models
   */
  static toDomainList(ormAddresses: ORMUserAddress[]): UserAddress[] {
    return ormAddresses.map((ormAddress) =>
      ORMUserAddressMapper.toDomain(ormAddress),
    );
  }
}

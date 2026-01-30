import { ORMShopOfficialBrand } from '../entities/shop';
import { ShopOfficialBrand } from 'src/modules/shop/models/shop-official-brand.model';

/**
 * Mapper for converting between ORM entity and domain model for ShopOfficialBrand.
 */
export class ORMShopOfficialBrandMapper {
  /**
   * Converts an ORM entity to a domain model.
   */
  static toDomain(orm: ORMShopOfficialBrand): ShopOfficialBrand {
    return new ShopOfficialBrand(
      orm.id,
      orm.shopId,
      orm.brandId,
      orm.applicationId,
      orm.grantedAt,
      orm.expiresAt,
      orm.revokedAt,
      orm.revokedReason,
    );
  }

  /**
   * Converts a domain model to an ORM entity.
   */
  static toOrm(domain: ShopOfficialBrand): ORMShopOfficialBrand {
    const orm = new ORMShopOfficialBrand();
    orm.id = domain.id;
    orm.shopId = domain.shopId;
    orm.brandId = domain.brandId;
    orm.applicationId = domain.applicationId;
    orm.grantedAt = domain.grantedAt;
    orm.expiresAt = domain.expiresAt;
    orm.revokedAt = domain.revokedAt;
    orm.revokedReason = domain.revokedReason;
    return orm;
  }

  /**
   * Converts an array of ORM entities to domain models.
   */
  static toDomainList(ormEntities: ORMShopOfficialBrand[]): ShopOfficialBrand[] {
    return ormEntities.map((orm) => this.toDomain(orm));
  }
}

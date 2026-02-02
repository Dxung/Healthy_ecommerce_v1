import { ORMShopBadge } from '../entities/shop';
import { ShopBadge } from 'src/modules/shop/models/shop-badge.model';
import { ORMBadgeRequirementMapper } from './badge-requirement.mapper.orm';

/**
 * Mapper for converting between ORM entity and domain model for ShopBadge.
 */
export class ORMShopBadgeMapper {
  /**
   * Converts an ORM entity to a domain model.
   * If requirements relation is loaded, they will be mapped as well.
   */
  static toDomain(orm: ORMShopBadge): ShopBadge {
    // Map requirements if they were loaded with the badge
    const requirements = orm.requirements
      ? ORMBadgeRequirementMapper.toDomainList(orm.requirements)
      : [];

    return new ShopBadge(
      orm.id,
      orm.code,
      orm.name,
      orm.description,
      orm.platformFeeDiscountPercent
        ? Number(orm.platformFeeDiscountPercent)
        : null,
      orm.searchBoostMultiplier ? Number(orm.searchBoostMultiplier) : null,
      orm.maxProductSlots,
      orm.isActive,
      orm.updatedAt,
      orm.deletedAt,
      requirements,
    );
  }

  /**
   * Converts a domain model to an ORM entity.
   * Note: Requirements are not mapped here as they are managed separately.
   */
  static toOrm(domain: ShopBadge): ORMShopBadge {
    const orm = new ORMShopBadge();
    orm.id = domain.id;
    orm.code = domain.code;
    orm.name = domain.name;
    orm.description = domain.description;
    orm.platformFeeDiscountPercent = domain.platformFeeDiscountPercent;
    orm.searchBoostMultiplier = domain.searchBoostMultiplier;
    orm.maxProductSlots = domain.maxProductSlots;
    orm.isActive = domain.isActive;
    orm.updatedAt = domain.updatedAt;
    orm.deletedAt = domain.deletedAt;
    return orm;
  }

  /**
   * Converts an array of ORM entities to domain models.
   */
  static toDomainList(ormEntities: ORMShopBadge[]): ShopBadge[] {
    return ormEntities.map((orm) => this.toDomain(orm));
  }
}

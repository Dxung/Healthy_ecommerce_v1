import { ORMShop } from '../entities/shop';
import { Shop } from 'src/modules/shop/models/shop.model';
import { ORMShopBadgeAssignmentMapper } from './shop-badge-assignment.mapper.orm';

/**
 * Mapper for converting between ORM entity and domain model for Shop.
 */
export class ORMShopMapper {
  /**
   * Converts an ORM entity to a domain model.
   * If badge assignments are loaded, they will be mapped as well.
   */
  static toDomain(orm: ORMShop): Shop {
    // Map badge assignments if they were loaded with the shop
    const badgeAssignments = orm.badgeAssignments
      ? ORMShopBadgeAssignmentMapper.toDomainList(orm.badgeAssignments)
      : [];

    return new Shop(
      orm.id,
      orm.registrationId,
      orm.userId,
      orm.name,
      orm.slug,
      orm.logoUrl,
      orm.coverUrl,
      orm.phone,
      orm.email,
      orm.addressLine,
      orm.wardId,
      orm.districtId,
      orm.provinceId,
      Number(orm.averageRating),
      orm.totalRatings,
      orm.totalProducts,
      orm.totalOrders,
      Number(orm.orderSuccessRate),
      Number(orm.responseTimeHours),
      Number(orm.returnRate),
      orm.status,
      orm.isRefundDebt,
      orm.isAdminSuspended,
      orm.statusReason,
      orm.statusChangedAt,
      orm.statusChangedBy,
      orm.createdAt,
      orm.updatedAt,
      orm.deletedAt,
      badgeAssignments,
    );
  }

  /**
   * Converts a domain model to an ORM entity.
   * Note: Badge assignments are not mapped here as they are managed separately.
   */
  static toOrm(domain: Shop): ORMShop {
    const orm = new ORMShop();
    orm.id = domain.id;
    orm.registrationId = domain.registrationId;
    orm.userId = domain.userId;
    orm.name = domain.name;
    orm.slug = domain.slug;
    orm.logoUrl = domain.logoUrl;
    orm.coverUrl = domain.coverUrl;
    orm.phone = domain.phone;
    orm.email = domain.email;
    orm.addressLine = domain.addressLine;
    orm.wardId = domain.wardId;
    orm.districtId = domain.districtId;
    orm.provinceId = domain.provinceId;
    orm.averageRating = domain.averageRating;
    orm.totalRatings = domain.totalRatings;
    orm.totalProducts = domain.totalProducts;
    orm.totalOrders = domain.totalOrders;
    orm.orderSuccessRate = domain.orderSuccessRate;
    orm.responseTimeHours = domain.responseTimeHours;
    orm.returnRate = domain.returnRate;
    orm.status = domain.status;
    orm.isRefundDebt = domain.isRefundDebt;
    orm.isAdminSuspended = domain.isAdminSuspended;
    orm.statusReason = domain.statusReason;
    orm.statusChangedAt = domain.statusChangedAt;
    orm.statusChangedBy = domain.statusChangedBy;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    orm.deletedAt = domain.deletedAt;
    return orm;
  }

  /**
   * Converts an array of ORM entities to domain models.
   */
  static toDomainList(ormEntities: ORMShop[]): Shop[] {
    return ormEntities.map((orm) => this.toDomain(orm));
  }
}

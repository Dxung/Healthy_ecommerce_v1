import { ORMShopBadgeAssignment } from '../entities/shop';
import { ShopBadgeAssignment } from 'src/modules/shop/models/shop-badge-assignment.model';

/**
 * Mapper for converting between ORM entity and domain model for ShopBadgeAssignment.
 * This class provides static methods to map data between the database layer (ORM)
 * and the domain layer, maintaining separation of concerns.
 */
export class ORMShopBadgeAssignmentMapper {
  /**
   * Converts an ORM entity to a domain model.
   * @param orm - The ORM entity from database
   * @returns The domain model
   */
  static toDomain(orm: ORMShopBadgeAssignment): ShopBadgeAssignment {
    return new ShopBadgeAssignment(
      orm.id,
      orm.shopId,
      orm.badgeCode,
      orm.brandId,
      orm.status,
      orm.grantedAt,
      orm.expiresAt,
      orm.disabledAt,
      orm.disabledReason,
      orm.updatedAt,
    );
  }

  /**
   * Converts a domain model to an ORM entity.
   * @param domain - The domain model
   * @returns The ORM entity for database operations
   */
  static toOrm(domain: ShopBadgeAssignment): ORMShopBadgeAssignment {
    const orm = new ORMShopBadgeAssignment();
    orm.id = domain.id;
    orm.shopId = domain.shopId;
    orm.badgeCode = domain.badgeCode;
    orm.brandId = domain.brandId;
    orm.status = domain.status;
    orm.grantedAt = domain.grantedAt;
    orm.expiresAt = domain.expiresAt;
    orm.disabledAt = domain.disabledAt;
    orm.disabledReason = domain.disabledReason;
    orm.updatedAt = domain.updatedAt;
    return orm;
  }

  /**
   * Converts an array of ORM entities to domain models.
   * @param ormEntities - Array of ORM entities
   * @returns Array of domain models
   */
  static toDomainList(
    ormEntities: ORMShopBadgeAssignment[],
  ): ShopBadgeAssignment[] {
    return ormEntities.map((orm) => this.toDomain(orm));
  }
}

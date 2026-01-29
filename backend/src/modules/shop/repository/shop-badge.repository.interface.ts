import type { ResultAsync } from 'neverthrow';
import type { DomainError } from 'src/shared/types/domain-error.type';
import type { ShopBadge } from '../models/shop-badge.model';
import type { ShopBadgeCode } from 'src/database/typeorm/entities/shop/enums/shop-badge-code.enum';

/**
 * Repository interface for ShopBadge entity operations.
 * ShopBadges are hardcoded - only is_active can be toggled.
 */
export interface IShopBadgeRepository {
  /**
   * Gets all badges (including inactive ones).
   * @param includeRequirements - Whether to include requirements relation
   * @returns All badges
   */
  findAll(includeRequirements?: boolean): ResultAsync<ShopBadge[], DomainError>;

  /**
   * Gets all active badges.
   * @param includeRequirements - Whether to include requirements relation
   * @returns Active badges only
   */
  findAllActive(
    includeRequirements?: boolean,
  ): ResultAsync<ShopBadge[], DomainError>;

  /**
   * Finds a badge by its code.
   * @param code - The badge code (preferred, approved, official)
   * @param includeRequirements - Whether to include requirements relation
   * @returns The badge if found, null otherwise
   */
  findByCode(
    code: ShopBadgeCode,
    includeRequirements?: boolean,
  ): ResultAsync<ShopBadge | null, DomainError>;

  /**
   * Finds a badge by its ID.
   * @param id - The badge ID
   * @param includeRequirements - Whether to include requirements relation
   * @returns The badge if found, null otherwise
   */
  findById(
    id: string,
    includeRequirements?: boolean,
  ): ResultAsync<ShopBadge | null, DomainError>;

  /**
   * Updates a badge (only is_active can be changed).
   * @param badge - The badge with updated data
   * @returns The updated badge
   */
  update(badge: ShopBadge): ResultAsync<ShopBadge, DomainError>;
}

import { Inject, Injectable } from '@nestjs/common';
import { ResultAsync, okAsync } from 'neverthrow';
import {
  IShopBadgeBenefitsService,
  ShopBadgeBenefits,
} from './shop-badge-benefits.service.interface';
import { IShopRepository } from './repository/shop.repository.interface';
import { IShopBadgeRepository } from './repository/shop-badge.repository.interface';
import {
  SHOP_REPOSITORY,
  SHOP_BADGE_REPOSITORY,
} from 'src/database/typeorm/tokens/database.token';
import type { DomainError } from 'src/shared/types/domain-error.type';
import { WithPosition } from 'src/common/decorators/with-position.decorator';

/**
 * Default benefits when no badges are assigned.
 */
const DEFAULT_BENEFITS: ShopBadgeBenefits = {
  platformFeeDiscountPercent: 0,
  searchBoostMultiplier: 1,
  maxProductSlots: null, // null = unlimited
};

@Injectable()
export class ShopBadgeBenefitsService implements IShopBadgeBenefitsService {
  constructor(
    @Inject(SHOP_REPOSITORY)
    private readonly shopRepository: IShopRepository,
    @Inject(SHOP_BADGE_REPOSITORY)
    private readonly badgeRepository: IShopBadgeRepository,
  ) {}

  @WithPosition()
  getShopBadgeBenefits(
    shopId: string,
  ): ResultAsync<ShopBadgeBenefits, DomainError> {
    // Get shop with badge assignments
    return this.shopRepository.findById(shopId).andThen((shop) => {
      if (!shop) {
        return okAsync(DEFAULT_BENEFITS);
      }

      const activeBadges = shop.getActiveBadges();
      if (activeBadges.length === 0) {
        return okAsync(DEFAULT_BENEFITS);
      }

      // Get all badge definitions to access benefit values
      return this.badgeRepository.findAllActive().map((badges) => {
        // Create a map of badge code -> badge for quick lookup
        const badgeMap = new Map(badges.map((b) => [b.code, b]));

        let maxFeeDiscount = 0;
        let maxSearchBoost = 1;
        let maxProductSlots: number | null = null;

        for (const assignment of activeBadges) {
          const badge = badgeMap.get(assignment.badgeCode);
          if (!badge) continue;

          // Platform fee discount - take highest
          if (
            badge.platformFeeDiscountPercent !== null &&
            badge.platformFeeDiscountPercent > maxFeeDiscount
          ) {
            maxFeeDiscount = badge.platformFeeDiscountPercent;
          }

          // Search boost - take highest
          if (
            badge.searchBoostMultiplier !== null &&
            badge.searchBoostMultiplier > maxSearchBoost
          ) {
            maxSearchBoost = badge.searchBoostMultiplier;
          }

          // Product slots - take highest (or keep null if any is unlimited)
          if (badge.maxProductSlots > 0) {
            if (maxProductSlots === null) {
              maxProductSlots = badge.maxProductSlots;
            } else {
              maxProductSlots = Math.max(
                maxProductSlots,
                badge.maxProductSlots,
              );
            }
          }
        }

        return {
          platformFeeDiscountPercent: maxFeeDiscount,
          searchBoostMultiplier: maxSearchBoost,
          maxProductSlots,
        };
      });
    });
  }

  @WithPosition()
  getEffectivePlatformFeeDiscount(
    shopId: string,
  ): ResultAsync<number, DomainError> {
    return this.getShopBadgeBenefits(shopId).map(
      (benefits) => benefits.platformFeeDiscountPercent,
    );
  }

  @WithPosition()
  getEffectiveSearchBoost(shopId: string): ResultAsync<number, DomainError> {
    return this.getShopBadgeBenefits(shopId).map(
      (benefits) => benefits.searchBoostMultiplier,
    );
  }

  @WithPosition()
  getEffectiveMaxProductSlots(
    shopId: string,
  ): ResultAsync<number | null, DomainError> {
    return this.getShopBadgeBenefits(shopId).map(
      (benefits) => benefits.maxProductSlots,
    );
  }
}

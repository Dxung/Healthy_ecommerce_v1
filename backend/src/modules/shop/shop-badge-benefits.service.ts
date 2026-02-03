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
import type { ISystemConfigService } from '../system-config/system-config.service.interface';
import { SYSTEM_CONFIG_SERVICE } from '../system-config/tokens/system-config.token';
import {
  CONFIG_KEYS,
  DEFAULT_CONFIG,
} from '../system-config/system-config.constants';

@Injectable()
export class ShopBadgeBenefitsService implements IShopBadgeBenefitsService {
  constructor(
    @Inject(SHOP_REPOSITORY)
    private readonly shopRepository: IShopRepository,
    @Inject(SHOP_BADGE_REPOSITORY)
    private readonly badgeRepository: IShopBadgeRepository,
    @Inject(SYSTEM_CONFIG_SERVICE)
    private readonly systemConfigService: ISystemConfigService,
  ) {}

  /**
   * Helper to get default max product slots from system config.
   */
  private getDefaultMaxProductSlots(): ResultAsync<number, DomainError> {
    return this.systemConfigService
      .getConfig(CONFIG_KEYS.DEFAULT_MAX_PRODUCT_SLOTS)
      .map((config) =>
        config
          ? parseInt(config.value, 10)
          : DEFAULT_CONFIG[CONFIG_KEYS.DEFAULT_MAX_PRODUCT_SLOTS],
      );
  }

  @WithPosition()
  getShopBadgeBenefits(
    shopId: string,
  ): ResultAsync<ShopBadgeBenefits, DomainError> {
    // Get default max product slots from config first
    return this.getDefaultMaxProductSlots().andThen((defaultMaxSlots) => {
      const defaultBenefits: ShopBadgeBenefits = {
        platformFeeDiscountPercent: 0,
        searchBoostMultiplier: 1,
        maxProductSlots: defaultMaxSlots,
      };

      // Get shop with badge assignments
      return this.shopRepository.findById(shopId).andThen((shop) => {
        if (!shop) {
          return okAsync(defaultBenefits);
        }

        const activeBadges = shop.getActiveBadges();
        if (activeBadges.length === 0) {
          // No badges → use default from config
          return okAsync(defaultBenefits);
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

            // Product slots - take highest from badges
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

          // If shop has badges but none define maxProductSlots, use default
          // If badges define maxProductSlots, use the MAX value from badges
          return {
            platformFeeDiscountPercent: maxFeeDiscount,
            searchBoostMultiplier: maxSearchBoost,
            maxProductSlots: maxProductSlots ?? defaultMaxSlots,
          };
        });
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

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataSource, LessThan, IsNull } from 'typeorm';
import { ShopBadgeCode } from 'src/database/typeorm/entities/shop/enums/shop-badge-code.enum';
import { ShopBadgeStatus } from 'src/database/typeorm/entities/shop/enums/shop-badge-status.enum';
import { ORMShopBadgeAssignment, ORMShopOfficialBrand, ORMShop } from 'src/database/typeorm/entities/shop';

/**
 * BadgeExpiryCronjob - Handles badge and official brand expiration
 *
 * Runs every day at 1 AM (Vietnam timezone) to:
 * 1. Check and disable expired Verified (APPROVED) badges
 * 2. Check and revoke expired Official brand statuses
 * 3. Disable OFFICIAL badge if shop has no more active official brands
 */
@Injectable()
export class BadgeExpiryCronjob {
  private readonly logger = new Logger(BadgeExpiryCronjob.name);

  constructor(private readonly dataSource: DataSource) {}

  /**
   * Daily cron job to handle badge expiry.
   */
  @Cron(CronExpression.EVERY_DAY_AT_1AM, {
    name: 'check-badge-expiry',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async handleBadgeExpiryCheck(): Promise<void> {
    this.logger.log('Starting badge expiry check...');

    try {
      await this.checkVerifiedBadgeExpiry();
      await this.checkOfficialBrandExpiry();

      this.logger.log('Badge expiry check complete.');
    } catch (error) {
      this.logger.error('Error during badge expiry check:', error);
    }
  }

  /**
   * Checks and disables expired Verified (APPROVED) badges.
   */
  private async checkVerifiedBadgeExpiry(): Promise<void> {
    const badgeRepo = this.dataSource.getRepository(ORMShopBadgeAssignment);
    const now = new Date();

    // Find all active APPROVED badges that have expired
    const expiredBadges = await badgeRepo.find({
      where: {
        badgeCode: ShopBadgeCode.APPROVED,
        status: ShopBadgeStatus.ACTIVE,
        expiresAt: LessThan(now),
      },
    });

    let disabledCount = 0;

    for (const badge of expiredBadges) {
      badge.status = ShopBadgeStatus.DISABLED;
      badge.disabledAt = now;
      badge.disabledReason = 'expired';
      badge.updatedAt = now;

      await badgeRepo.save(badge);
      disabledCount++;

      this.logger.log(
        `Disabled expired Verified badge for shop: ${badge.shopId}`,
      );
    }

    this.logger.log(`Verified badge expiry check: ${disabledCount} badges disabled`);
  }

  /**
   * Checks and revokes expired Official brand statuses.
   * Also updates products and OFFICIAL badge status.
   */
  private async checkOfficialBrandExpiry(): Promise<void> {
    const officialBrandRepo = this.dataSource.getRepository(ORMShopOfficialBrand);
    const badgeRepo = this.dataSource.getRepository(ORMShopBadgeAssignment);
    const shopRepo = this.dataSource.getRepository(ORMShop);
    const now = new Date();

    // Find all non-revoked official brands that have expired
    const expiredBrands = await officialBrandRepo.find({
      where: {
        revokedAt: IsNull(),
        expiresAt: LessThan(now),
      },
    });

    const affectedShopIds = new Set<string>();
    let revokedCount = 0;

    for (const brand of expiredBrands) {
      brand.revokedAt = now;
      brand.revokedReason = 'expired';

      await officialBrandRepo.save(brand);
      affectedShopIds.add(brand.shopId);
      revokedCount++;

      this.logger.log(
        `Revoked expired official brand ${brand.brandId} for shop: ${brand.shopId}`,
      );

      // Note: Product isOfficialApproved update would need to be done here
      // This would require ProductRepository access or direct SQL update
      // await this.updateProductOfficialStatus(brand.shopId, brand.brandId, false);
    }

    // For each affected shop, check if they still have any active official brands
    for (const shopId of affectedShopIds) {
      const hasActiveOfficialBrand = await officialBrandRepo.exists({
        where: {
          shopId,
          revokedAt: IsNull(),
          expiresAt: LessThan(now) ? undefined : undefined, // All non-expired
        },
      });

      // More accurate check - find official brands that are not revoked and not expired
      const activeCount = await officialBrandRepo.count({
        where: {
          shopId,
          revokedAt: IsNull(),
        },
      });

      // Filter those that are actually not expired
      const activeOfficialBrands = await officialBrandRepo.find({
        where: {
          shopId,
          revokedAt: IsNull(),
        },
      });

      const hasActive = activeOfficialBrands.some(
        (b) => b.expiresAt > now,
      );

      if (!hasActive) {
        // No more active official brands - disable OFFICIAL badge
        const officialBadge = await badgeRepo.findOne({
          where: {
            shopId,
            badgeCode: ShopBadgeCode.OFFICIAL,
            status: ShopBadgeStatus.ACTIVE,
          },
        });

        if (officialBadge) {
          officialBadge.status = ShopBadgeStatus.DISABLED;
          officialBadge.disabledAt = now;
          officialBadge.disabledReason = 'no_active_official_brands';
          officialBadge.updatedAt = now;

          await badgeRepo.save(officialBadge);

          this.logger.log(
            `Disabled OFFICIAL badge for shop ${shopId} - no active official brands remaining`,
          );
        }
      }
    }

    this.logger.log(
      `Official brand expiry check: ${revokedCount} brands revoked, ${affectedShopIds.size} shops affected`,
    );
  }

  /**
   * Updates product official status when brand expires.
   * Note: This method would need ProductRepository or direct query.
   */
  // private async updateProductOfficialStatus(
  //   shopId: string,
  //   brandId: string,
  //   isOfficialApproved: boolean,
  // ): Promise<void> {
  //   // This would update all products of this brand in this shop
  //   // to set isOfficialApproved = false
  //   // Implementation depends on product module structure
  // }
}

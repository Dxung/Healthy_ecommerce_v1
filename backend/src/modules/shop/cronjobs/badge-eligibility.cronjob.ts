import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataSource } from 'typeorm';
import { ShopBadgeCode } from 'src/database/typeorm/entities/shop/enums/shop-badge-code.enum';
import { ShopAttributeCode } from 'src/database/typeorm/entities/shop/enums/shop-attribute-code.enum';
import { ComparisonOperator } from 'src/database/typeorm/entities/shop/enums/comparison-operator.enum';
import { ShopStatus } from 'src/database/typeorm/entities/shop/enums/shop-status.enum';
import { ShopBadgeStatus } from 'src/database/typeorm/entities/shop/enums/shop-badge-status.enum';
import {
  ORMShop,
  ORMShopBadge,
  ORMBadgeRequirement,
  ORMShopBadgeAssignment,
} from 'src/database/typeorm/entities/shop';
import { v7 as uuidv7 } from 'uuid';

/**
 * BadgeEligibilityCronjob - Handles automated badge granting/revoking
 *
 * Runs every day at midnight (Vietnam timezone) to:
 * 1. Check all active shops against preferred badge requirements
 * 2. Grant preferred badge to shops meeting all requirements
 * 3. Revoke preferred badge from shops no longer meeting requirements
 */
@Injectable()
export class BadgeEligibilityCronjob {
  private readonly logger = new Logger(BadgeEligibilityCronjob.name);

  constructor(private readonly dataSource: DataSource) {}

  /**
   * Cron job that runs every 24 hours to check preferred badge eligibility.
   * - Checks all active shops
   * - Grants preferred badge to shops meeting requirements
   * - Revokes preferred badge from shops no longer meeting requirements
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'check-preferred-badge-eligibility',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async handlePreferredBadgeCheck(): Promise<void> {
    this.logger.log('Starting preferred badge eligibility check...');

    try {
      // Get the preferred badge configuration
      const badgeRepo = this.dataSource.getRepository(ORMShopBadge);
      const preferredBadge = await badgeRepo.findOne({
        where: { code: ShopBadgeCode.PREFERRED, isActive: true },
      });

      if (!preferredBadge) {
        this.logger.log('Preferred badge is not active. Skipping check.');
        return;
      }

      // Get active requirements for preferred badge
      const requirementRepo =
        this.dataSource.getRepository(ORMBadgeRequirement);
      const requirements = await requirementRepo.find({
        where: {
          badgeCode: ShopBadgeCode.PREFERRED,
          isActive: true,
        },
      });

      // Filter only attribute requirements (document requirements are not used for preferred badge)
      const attributeRequirements = requirements.filter(
        (r) => r.requirementType === 'attribute',
      );

      if (attributeRequirements.length === 0) {
        this.logger.log(
          'No attribute requirements for preferred badge. Skipping check.',
        );
        return;
      }

      // Get all active shops
      const shopRepo = this.dataSource.getRepository(ORMShop);
      const shops = await shopRepo.find({
        where: { status: ShopStatus.ACTIVE },
        relations: ['badgeAssignments'],
      });

      const badgeAssignmentRepo = this.dataSource.getRepository(
        ORMShopBadgeAssignment,
      );

      let granted = 0;
      let revoked = 0;

      for (const shop of shops) {
        const activePreferredBadge = shop.badgeAssignments?.find(
          (ba) =>
            ba.badgeCode === ShopBadgeCode.PREFERRED &&
            ba.status === ShopBadgeStatus.ACTIVE,
        );

        const meetsRequirements = this.checkShopMeetsRequirements(
          shop,
          attributeRequirements,
        );

        if (meetsRequirements && !activePreferredBadge) {
          // Check if there's a disabled badge assignment to reactivate
          const disabledAssignment = shop.badgeAssignments?.find(
            (ba) =>
              ba.badgeCode === ShopBadgeCode.PREFERRED &&
              ba.status === ShopBadgeStatus.DISABLED,
          );

          if (disabledAssignment) {
            // Reactivate existing assignment
            disabledAssignment.status = ShopBadgeStatus.ACTIVE;
            disabledAssignment.disabledAt = null;
            disabledAssignment.disabledReason = null;
            await badgeAssignmentRepo.save(disabledAssignment);
          } else {
            // Create new badge assignment
            const newAssignment = new ORMShopBadgeAssignment();
            newAssignment.id = uuidv7();
            newAssignment.shopId = shop.id;
            newAssignment.badgeCode = ShopBadgeCode.PREFERRED;
            newAssignment.status = ShopBadgeStatus.ACTIVE;
            newAssignment.grantedAt = new Date();

            await badgeAssignmentRepo.save(newAssignment);
          }
          granted++;
          this.logger.log(
            `Granted preferred badge to shop: ${shop.name} (${shop.id})`,
          );
        } else if (!meetsRequirements && activePreferredBadge) {
          // Revoke badge by setting status to disabled
          activePreferredBadge.status = ShopBadgeStatus.DISABLED;
          activePreferredBadge.disabledAt = new Date();
          activePreferredBadge.disabledReason =
            'Không còn đạt yêu cầu badge Shop Yêu Thích';
          await badgeAssignmentRepo.save(activePreferredBadge);
          revoked++;
          this.logger.log(
            `Revoked preferred badge from shop: ${shop.name} (${shop.id})`,
          );
        }
      }

      this.logger.log(
        `Preferred badge check complete. Granted: ${granted}, Revoked: ${revoked}`,
      );
    } catch (error) {
      this.logger.error(
        'Error during preferred badge eligibility check:',
        error,
      );
    }
  }

  /**
   * Checks if a shop meets all attribute requirements.
   */
  private checkShopMeetsRequirements(
    shop: ORMShop,
    requirements: ORMBadgeRequirement[],
  ): boolean {
    for (const req of requirements) {
      const shopValue = this.getShopAttributeValue(shop, req.attributeCode!);
      const requiredValue = Number(req.attributeValue);

      if (!this.compareValues(shopValue, req.operator!, requiredValue)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Gets the shop attribute value based on attribute code.
   */
  private getShopAttributeValue(
    shop: ORMShop,
    attributeCode: ShopAttributeCode,
  ): number {
    switch (attributeCode) {
      case ShopAttributeCode.AVERAGE_RATING:
        return Number(shop.averageRating);
      case ShopAttributeCode.ORDER_SUCCESS_RATE:
        return Number(shop.orderSuccessRate);
      case ShopAttributeCode.TOTAL_ORDERS_30D:
        // Note: This would need a separate calculation based on order history
        // For now, using totalOrders as a placeholder
        return shop.totalOrders;
      case ShopAttributeCode.RESPONSE_TIME_HOURS:
        return Number(shop.responseTimeHours);
      case ShopAttributeCode.RETURN_RATE:
        return Number(shop.returnRate);
      case ShopAttributeCode.PENALTY_POINTS:
        // Would need penalty system integration
        return 0;
      case ShopAttributeCode.PENALTY_TIER:
        // Would need penalty system integration
        return 0;
      default:
        return 0;
    }
  }

  /**
   * Compares two values using the specified operator.
   */
  private compareValues(
    shopValue: number,
    operator: ComparisonOperator,
    requiredValue: number,
  ): boolean {
    switch (operator) {
      case ComparisonOperator.GT:
        return shopValue > requiredValue;
      case ComparisonOperator.GTE:
        return shopValue >= requiredValue;
      case ComparisonOperator.LT:
        return shopValue < requiredValue;
      case ComparisonOperator.LTE:
        return shopValue <= requiredValue;
      case ComparisonOperator.EQ:
        return shopValue === requiredValue;
      default:
        return false;
    }
  }
}

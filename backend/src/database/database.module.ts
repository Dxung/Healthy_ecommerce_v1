import { getTypeOrmConfig } from 'src/database/configs/typeorm.config';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OrmUserCoreRepository } from './typeorm/repositories/user/user-core.typeorm.repository';
import { OrmUserAuthRepository } from './typeorm/repositories/auth/user-auth.typeorm.repository';
import { OrmUserSessionRepository } from './typeorm/repositories/session/user-session.typeorm.repository';
import { OrmUserAddressRepository } from './typeorm/repositories/user/user-address.typeorm.repository';
import { OrmLocationRepository } from './typeorm/repositories/location/location.typeorm.repository';
import { OrmAuthorizationRepository } from './typeorm/repositories/authorization/authorization.typeorm.repository';
import { OrmRoleRepository } from './typeorm/repositories/authorization/role.typeorm.repository';
import { OrmPermissionRepository } from './typeorm/repositories/authorization/permission.typeorm.repository';
import { OrmShopRegistrationRequestRepository } from './typeorm/repositories/shop/shop-registration-request.typeorm.repository';
import { OrmShopRepository } from './typeorm/repositories/shop/shop.typeorm.repository';
import { OrmShopBadgeRepository } from './typeorm/repositories/shop/shop-badge.typeorm.repository';
import { OrmDocumentTypeRepository } from './typeorm/repositories/shop/document-type.typeorm.repository';
import { OrmBadgeRequirementRepository } from './typeorm/repositories/shop/badge-requirement.typeorm.repository';
import { OrmCategoryRepository } from './typeorm/repositories/product/category.typeorm.repository';
import { OrmBrandRepository } from './typeorm/repositories/product/brand.typeorm.repository';
import { OrmProductRepository } from './typeorm/repositories/product/product.typeorm.repository';
import { OrmProductImageRepository } from './typeorm/repositories/product/product-image.typeorm.repository';
import { OrmProductIngredientRepository } from './typeorm/repositories/product/product-ingredient.typeorm.repository';
import { OrmProductOptionRepository } from './typeorm/repositories/product/product-option.typeorm.repository';
import { OrmProductVariantRepository } from './typeorm/repositories/product/product-variant.typeorm.repository';
import { OrmAllergenTagRepository } from './typeorm/repositories/product/allergen-tag.typeorm.repository';
import { OrmDietTagRepository } from './typeorm/repositories/product/diet-tag.typeorm.repository';
import { OrmUnitRepository } from './typeorm/repositories/product/unit.typeorm.repository';
import { OrmUnitConversionRepository } from './typeorm/repositories/product/unit-conversion.typeorm.repository';
import { OrmProductNutritionRepository } from './typeorm/repositories/product/product-nutrition.typeorm.repository';
import { OrmCartRepository } from './typeorm/repositories/cart/cart.typeorm.repository';
import { OrmOrderRepository } from './typeorm/repositories/order/order.typeorm.repository';
import { OrmReviewRepository } from './typeorm/repositories/review/review.typeorm.repository';
import { OrmWalletRepository } from './typeorm/repositories/payment/wallet.typeorm.repository';
import { OrmEscrowRepository } from './typeorm/repositories/payment/escrow.typeorm.repository';
import { OrmPaymentTransactionRepository } from './typeorm/repositories/payment/payment-transaction.typeorm.repository';
import { OrmSystemConfigRepository } from './typeorm/repositories/config/system-config.typeorm.repository';
import {
  OrmHealthProfileRepository,
  OrmFoodPresetRepository,
  OrmMealLogRepository,
  OrmExerciseLogRepository,
  OrmUserFollowRepository,
  OrmDietPreferenceRepository,
  OrmAllergenExclusionRepository,
} from './typeorm/repositories/meal-plan';
import { OrmBuyerCoinWalletRepository } from './typeorm/repositories/buyer/buyer-coin-wallet.typeorm.repository';
import { OrmBadgeApplicationRepository } from './typeorm/repositories/shop/badge-application.typeorm.repository';
import { OrmShopOfficialBrandRepository } from './typeorm/repositories/shop/shop-official-brand.typeorm.repository';
import { OrmBrandDocumentRequirementRepository } from './typeorm/repositories/shop/brand-document-requirement.typeorm.repository';
import {
  USER_AUTH_REPOSITORY,
  USER_CORE_REPOSITORY,
  USER_SESSION_REPOSITORY,
  USER_ADDRESS_REPOSITORY,
  LOCATION_REPOSITORY,
  AUTHORIZATION_REPOSITORY,
  ROLE_REPOSITORY,
  PERMISSION_REPOSITORY,
  SHOP_REGISTRATION_REQUEST_REPOSITORY,
  SHOP_REPOSITORY,
  SHOP_BADGE_REPOSITORY,
  DOCUMENT_TYPE_REPOSITORY,
  BADGE_REQUIREMENT_REPOSITORY,
  CATEGORY_REPOSITORY,
  BRAND_REPOSITORY,
  PRODUCT_REPOSITORY,
  PRODUCT_IMAGE_REPOSITORY,
  PRODUCT_INGREDIENT_REPOSITORY,
  PRODUCT_OPTION_REPOSITORY,
  PRODUCT_VARIANT_REPOSITORY,
  ALLERGEN_TAG_REPOSITORY,
  DIET_TAG_REPOSITORY,
  UNIT_REPOSITORY,
  UNIT_CONVERSION_REPOSITORY,
  PRODUCT_NUTRITION_REPOSITORY,
  CART_REPOSITORY,
  ORDER_REPOSITORY,
  REVIEW_REPOSITORY,
  WALLET_REPOSITORY,
  ESCROW_REPOSITORY,
  PAYMENT_TRANSACTION_REPOSITORY,
  SYSTEM_CONFIG_REPOSITORY,
  HEALTH_PROFILE_REPOSITORY,
  FOOD_PRESET_REPOSITORY,
  MEAL_LOG_REPOSITORY,
  EXERCISE_LOG_REPOSITORY,
  USER_FOLLOW_REPOSITORY,
  DIET_PREFERENCE_REPOSITORY,
  ALLERGEN_EXCLUSION_REPOSITORY,
  BUYER_COIN_WALLET_REPOSITORY,
  BADGE_APPLICATION_REPOSITORY,
  SHOP_OFFICIAL_BRAND_REPOSITORY,
  BRAND_DOCUMENT_REQUIREMENT_REPOSITORY,
} from './typeorm/tokens/database.token';
import { AlsModule } from 'src/shared/als/als.module';

/**
 * Database module that sets up config and export repositories.
 * Must be modified when switching database or adding new repositories.
 */
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getTypeOrmConfig,
    }),
    AlsModule,
  ],
  providers: [
    {
      provide: USER_CORE_REPOSITORY,
      useClass: OrmUserCoreRepository,
    },
    {
      provide: USER_AUTH_REPOSITORY,
      useClass: OrmUserAuthRepository,
    },
    {
      provide: USER_SESSION_REPOSITORY,
      useClass: OrmUserSessionRepository,
    },
    {
      provide: USER_ADDRESS_REPOSITORY,
      useClass: OrmUserAddressRepository,
    },
    {
      provide: LOCATION_REPOSITORY,
      useClass: OrmLocationRepository,
    },
    {
      provide: AUTHORIZATION_REPOSITORY,
      useClass: OrmAuthorizationRepository,
    },
    {
      provide: ROLE_REPOSITORY,
      useClass: OrmRoleRepository,
    },
    {
      provide: PERMISSION_REPOSITORY,
      useClass: OrmPermissionRepository,
    },
    {
      provide: SHOP_REGISTRATION_REQUEST_REPOSITORY,
      useClass: OrmShopRegistrationRequestRepository,
    },
    {
      provide: SHOP_REPOSITORY,
      useClass: OrmShopRepository,
    },
    {
      provide: SHOP_BADGE_REPOSITORY,
      useClass: OrmShopBadgeRepository,
    },
    {
      provide: DOCUMENT_TYPE_REPOSITORY,
      useClass: OrmDocumentTypeRepository,
    },
    {
      provide: BADGE_REQUIREMENT_REPOSITORY,
      useClass: OrmBadgeRequirementRepository,
    },
    {
      provide: CATEGORY_REPOSITORY,
      useClass: OrmCategoryRepository,
    },
    {
      provide: BRAND_REPOSITORY,
      useClass: OrmBrandRepository,
    },
    {
      provide: PRODUCT_REPOSITORY,
      useClass: OrmProductRepository,
    },
    {
      provide: PRODUCT_IMAGE_REPOSITORY,
      useClass: OrmProductImageRepository,
    },
    {
      provide: PRODUCT_INGREDIENT_REPOSITORY,
      useClass: OrmProductIngredientRepository,
    },
    {
      provide: PRODUCT_OPTION_REPOSITORY,
      useClass: OrmProductOptionRepository,
    },
    {
      provide: PRODUCT_VARIANT_REPOSITORY,
      useClass: OrmProductVariantRepository,
    },
    {
      provide: ALLERGEN_TAG_REPOSITORY,
      useClass: OrmAllergenTagRepository,
    },
    {
      provide: DIET_TAG_REPOSITORY,
      useClass: OrmDietTagRepository,
    },
    {
      provide: UNIT_REPOSITORY,
      useClass: OrmUnitRepository,
    },
    {
      provide: UNIT_CONVERSION_REPOSITORY,
      useClass: OrmUnitConversionRepository,
    },
    {
      provide: PRODUCT_NUTRITION_REPOSITORY,
      useClass: OrmProductNutritionRepository,
    },
    {
      provide: CART_REPOSITORY,
      useClass: OrmCartRepository,
    },
    {
      provide: ORDER_REPOSITORY,
      useClass: OrmOrderRepository,
    },
    {
      provide: REVIEW_REPOSITORY,
      useClass: OrmReviewRepository,
    },
    {
      provide: WALLET_REPOSITORY,
      useClass: OrmWalletRepository,
    },
    {
      provide: ESCROW_REPOSITORY,
      useClass: OrmEscrowRepository,
    },
    {
      provide: PAYMENT_TRANSACTION_REPOSITORY,
      useClass: OrmPaymentTransactionRepository,
    },
    {
      provide: SYSTEM_CONFIG_REPOSITORY,
      useClass: OrmSystemConfigRepository,
    },
    {
      provide: HEALTH_PROFILE_REPOSITORY,
      useClass: OrmHealthProfileRepository,
    },
    {
      provide: FOOD_PRESET_REPOSITORY,
      useClass: OrmFoodPresetRepository,
    },
    {
      provide: MEAL_LOG_REPOSITORY,
      useClass: OrmMealLogRepository,
    },
    {
      provide: EXERCISE_LOG_REPOSITORY,
      useClass: OrmExerciseLogRepository,
    },
    {
      provide: USER_FOLLOW_REPOSITORY,
      useClass: OrmUserFollowRepository,
    },
    {
      provide: DIET_PREFERENCE_REPOSITORY,
      useClass: OrmDietPreferenceRepository,
    },
    {
      provide: ALLERGEN_EXCLUSION_REPOSITORY,
      useClass: OrmAllergenExclusionRepository,
    },
    {
      provide: BUYER_COIN_WALLET_REPOSITORY,
      useClass: OrmBuyerCoinWalletRepository,
    },
    {
      provide: BADGE_APPLICATION_REPOSITORY,
      useClass: OrmBadgeApplicationRepository,
    },
    {
      provide: SHOP_OFFICIAL_BRAND_REPOSITORY,
      useClass: OrmShopOfficialBrandRepository,
    },
    {
      provide: BRAND_DOCUMENT_REQUIREMENT_REPOSITORY,
      useClass: OrmBrandDocumentRequirementRepository,
    },
  ],
  exports: [
    USER_CORE_REPOSITORY,
    USER_AUTH_REPOSITORY,
    USER_SESSION_REPOSITORY,
    USER_ADDRESS_REPOSITORY,
    LOCATION_REPOSITORY,
    AUTHORIZATION_REPOSITORY,
    ROLE_REPOSITORY,
    PERMISSION_REPOSITORY,
    SHOP_REGISTRATION_REQUEST_REPOSITORY,
    SHOP_REPOSITORY,
    SHOP_BADGE_REPOSITORY,
    DOCUMENT_TYPE_REPOSITORY,
    BADGE_REQUIREMENT_REPOSITORY,
    CATEGORY_REPOSITORY,
    BRAND_REPOSITORY,
    PRODUCT_REPOSITORY,
    PRODUCT_IMAGE_REPOSITORY,
    PRODUCT_INGREDIENT_REPOSITORY,
    PRODUCT_OPTION_REPOSITORY,
    PRODUCT_VARIANT_REPOSITORY,
    ALLERGEN_TAG_REPOSITORY,
    DIET_TAG_REPOSITORY,
    UNIT_REPOSITORY,
    UNIT_CONVERSION_REPOSITORY,
    PRODUCT_NUTRITION_REPOSITORY,
    CART_REPOSITORY,
    ORDER_REPOSITORY,
    REVIEW_REPOSITORY,
    WALLET_REPOSITORY,
    ESCROW_REPOSITORY,
    PAYMENT_TRANSACTION_REPOSITORY,
    SYSTEM_CONFIG_REPOSITORY,
    HEALTH_PROFILE_REPOSITORY,
    FOOD_PRESET_REPOSITORY,
    MEAL_LOG_REPOSITORY,
    EXERCISE_LOG_REPOSITORY,
    USER_FOLLOW_REPOSITORY,
    DIET_PREFERENCE_REPOSITORY,
    ALLERGEN_EXCLUSION_REPOSITORY,
    BUYER_COIN_WALLET_REPOSITORY,
    BADGE_APPLICATION_REPOSITORY,
    SHOP_OFFICIAL_BRAND_REPOSITORY,
    BRAND_DOCUMENT_REQUIREMENT_REPOSITORY,
  ],
})
export class DatabaseModule {}

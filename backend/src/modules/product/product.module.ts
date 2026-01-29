import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { AlsModule } from 'src/shared/als/als.module';
import { UoWModule } from 'src/shared/unitOfWork/uow.module';
import { ShopModule } from '../shop/shop.module';
import { ImageProcessingModule } from 'src/shared/image-processing/image-processing.module';

// Tokens
import {
  CATEGORY_SERVICE,
  BRAND_SERVICE,
  SHOP_PRODUCT_SERVICE,
  ADMIN_PRODUCT_SERVICE,
  PUBLIC_PRODUCT_SERVICE,
  ALLERGEN_TAG_SERVICE,
  DIET_TAG_SERVICE,
  UNIT_SERVICE,
} from './tokens/product.token';

// Services
import { CategoryService } from './category.service';
import { BrandService } from './brand.service';
import { ShopProductService } from './shop-product.service';
import { AdminProductService } from './admin-product.service';
import { PublicProductService } from './public-product.service';
import { AllergenTagService } from './allergen-tag.service';
import { DietTagService } from './diet-tag.service';
import { UnitService } from './unit.service';

// Controllers
import { AdminCategoryController } from './admin-category.controller';
import { PublicCategoryController } from './public-category.controller';
import { AdminBrandController } from './admin-brand.controller';
import { PublicBrandController } from './public-brand.controller';
import { ShopProductController } from './shop-product.controller';
import { AdminProductController } from './admin-product.controller';
import { PublicProductController } from './public-product.controller';
import { AdminAllergenTagController } from './admin-allergen-tag.controller';
import { PublicAllergenTagController } from './public-allergen-tag.controller';
import { AdminDietTagController } from './admin-diet-tag.controller';
import { PublicDietTagController } from './public-diet-tag.controller';
import { AdminUnitController } from './admin-unit.controller';
import { PublicUnitController } from './public-unit.controller';
import { SessionModule } from '../session/session.module';
import { AuthorizationModule } from '../authorization/authorization.module';

@Module({
  imports: [
    DatabaseModule,
    AlsModule,
    UoWModule,
    ShopModule,
    SessionModule,
    AuthorizationModule,
    ImageProcessingModule,
  ],
  providers: [
    {
      provide: CATEGORY_SERVICE,
      useClass: CategoryService,
    },
    {
      provide: BRAND_SERVICE,
      useClass: BrandService,
    },
    {
      provide: SHOP_PRODUCT_SERVICE,
      useClass: ShopProductService,
    },
    {
      provide: ADMIN_PRODUCT_SERVICE,
      useClass: AdminProductService,
    },
    {
      provide: PUBLIC_PRODUCT_SERVICE,
      useClass: PublicProductService,
    },
    {
      provide: ALLERGEN_TAG_SERVICE,
      useClass: AllergenTagService,
    },
    {
      provide: DIET_TAG_SERVICE,
      useClass: DietTagService,
    },
    {
      provide: UNIT_SERVICE,
      useClass: UnitService,
    },
  ],
  controllers: [
    // Category controllers
    AdminCategoryController,
    PublicCategoryController,
    // Brand controllers
    AdminBrandController,
    PublicBrandController,
    // Product controllers
    ShopProductController,
    AdminProductController,
    PublicProductController,
    // Tag controllers
    AdminAllergenTagController,
    PublicAllergenTagController,
    AdminDietTagController,
    PublicDietTagController,
    // Unit controllers
    AdminUnitController,
    PublicUnitController,
  ],
  exports: [
    CATEGORY_SERVICE,
    BRAND_SERVICE,
    SHOP_PRODUCT_SERVICE,
    ADMIN_PRODUCT_SERVICE,
    PUBLIC_PRODUCT_SERVICE,
    ALLERGEN_TAG_SERVICE,
    DIET_TAG_SERVICE,
    UNIT_SERVICE,
  ],
})
export class ProductModule {}

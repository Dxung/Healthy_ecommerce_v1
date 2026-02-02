import {
  ORMProduct,
  ORMProductImage,
  ORMProductIngredient,
  ORMProductOption,
  ORMProductOptionValue,
  ORMProductVariant,
  ORMProductVariantOption,
} from '../entities/product';
import { Product } from 'src/modules/product/models/product.model';
import { ProductImage } from 'src/modules/product/models/product-image.model';
import { ProductIngredient } from 'src/modules/product/models/product-ingredient.model';
import { ProductOption } from 'src/modules/product/models/product-option.model';
import { ProductOptionValue } from 'src/modules/product/models/product-option-value.model';
import { ProductVariant } from 'src/modules/product/models/product-variant.model';

/**
 * Mapper for converting between ORM entities and domain models for Product and related entities.
 */
export class ORMProductMapper {
  // ======================== PRODUCT ========================

  /**
   * Converts a Product ORM entity to domain model.
   * Maps images, options, and variants if loaded.
   */
  static toDomain(orm: ORMProduct): Product {
    const images = orm.images
      ? orm.images.map((img) => this.imageToDomain(img))
      : [];

    const ingredients = orm.ingredients
      ? orm.ingredients.map((ing) => this.ingredientToDomain(ing))
      : [];

    const options = orm.options
      ? orm.options.map((opt) => this.optionToDomain(opt))
      : [];

    const variants = orm.variants
      ? orm.variants.map((v) => this.variantToDomain(v))
      : [];

    return new Product(
      orm.id,
      orm.shopId,
      orm.categoryId,
      orm.brandId,
      orm.name,
      orm.slug,
      orm.description,
      orm.thumbnailUrl,
      Number(orm.minPrice),
      Number(orm.maxPrice),
      orm.totalSold,
      Number(orm.averageRating),
      orm.totalRatings,
      orm.isOfficialApproved,
      orm.isVisible,
      orm.servingSize ? Number(orm.servingSize) : null,
      orm.servingUnitId,
      orm.status,
      orm.createdAt,
      orm.updatedAt,
      orm.deletedAt,
      images,
      ingredients,
      options,
      variants,
    );
  }

  /**
   * Converts a Product domain model to ORM entity.
   * Note: Relations (images, options, variants) are managed separately.
   */
  static toOrm(domain: Product): ORMProduct {
    const orm = new ORMProduct();
    orm.id = domain.id;
    orm.shopId = domain.shopId;
    orm.categoryId = domain.categoryId;
    orm.brandId = domain.brandId;
    orm.name = domain.name;
    orm.slug = domain.slug;
    orm.description = domain.description;
    orm.thumbnailUrl = domain.thumbnailUrl;
    orm.minPrice = domain.minPrice;
    orm.maxPrice = domain.maxPrice;
    orm.totalSold = domain.totalSold;
    orm.averageRating = domain.averageRating;
    orm.totalRatings = domain.totalRatings;
    orm.isOfficialApproved = domain.isOfficialApproved;
    orm.isVisible = domain.isVisible;
    orm.servingSize =
      domain.servingSize !== null ? String(domain.servingSize) : null;
    orm.servingUnitId = domain.servingUnitId;
    orm.status = domain.status;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    orm.deletedAt = domain.deletedAt;
    return orm;
  }

  static toDomainList(ormEntities: ORMProduct[]): Product[] {
    return ormEntities.map((orm) => this.toDomain(orm));
  }

  // ======================== IMAGE ========================

  static imageToDomain(orm: ORMProductImage): ProductImage {
    return new ProductImage(
      orm.id,
      orm.productId,
      orm.imageUrl,
      orm.sortOrder,
      orm.createdAt,
    );
  }

  static imageToOrm(domain: ProductImage): ORMProductImage {
    const orm = new ORMProductImage();
    orm.id = domain.id;
    orm.productId = domain.productId;
    orm.imageUrl = domain.imageUrl;
    orm.sortOrder = domain.sortOrder;
    orm.createdAt = domain.createdAt;
    return orm;
  }

  // ======================== INGREDIENT ========================

  static ingredientToDomain(orm: ORMProductIngredient): ProductIngredient {
    return new ProductIngredient(
      orm.id,
      orm.productId,
      orm.name,
      orm.sortOrder,
      orm.createdAt,
    );
  }

  static ingredientToOrm(domain: ProductIngredient): ORMProductIngredient {
    const orm = new ORMProductIngredient();
    orm.id = domain.id;
    orm.productId = domain.productId;
    orm.name = domain.name;
    orm.sortOrder = domain.sortOrder;
    orm.createdAt = domain.createdAt;
    return orm;
  }

  // ======================== OPTION ========================

  static optionToDomain(orm: ORMProductOption): ProductOption {
    const values = orm.values
      ? orm.values.map((v) => this.optionValueToDomain(v))
      : [];

    return new ProductOption(
      orm.id,
      orm.productId,
      orm.name,
      orm.sortOrder,
      orm.createdAt,
      values,
    );
  }

  static optionToOrm(domain: ProductOption): ORMProductOption {
    const orm = new ORMProductOption();
    orm.id = domain.id;
    orm.productId = domain.productId;
    orm.name = domain.name;
    orm.sortOrder = domain.sortOrder;
    orm.createdAt = domain.createdAt;
    return orm;
  }

  // ======================== OPTION VALUE ========================

  static optionValueToDomain(orm: ORMProductOptionValue): ProductOptionValue {
    return new ProductOptionValue(
      orm.id,
      orm.optionId,
      orm.value,
      orm.sortOrder,
      orm.createdAt,
    );
  }

  static optionValueToOrm(domain: ProductOptionValue): ORMProductOptionValue {
    const orm = new ORMProductOptionValue();
    orm.id = domain.id;
    orm.optionId = domain.optionId;
    orm.value = domain.value;
    orm.sortOrder = domain.sortOrder;
    orm.createdAt = domain.createdAt;
    return orm;
  }

  // ======================== VARIANT ========================

  static variantToDomain(orm: ORMProductVariant): ProductVariant {
    // Extract option value IDs from variant options if loaded
    const optionValueIds = orm.optionValues
      ? orm.optionValues.map((vo) => vo.optionValueId)
      : [];

    // Ensure expiryDate is a proper Date object (PostgreSQL date type may return string)
    let expiryDate: Date | null = null;
    if (orm.expiryDate) {
      expiryDate =
        orm.expiryDate instanceof Date
          ? orm.expiryDate
          : new Date(orm.expiryDate);
    }

    return new ProductVariant(
      orm.id,
      orm.productId,
      orm.sku,
      orm.name,
      Number(orm.price),
      orm.compareAtPrice ? Number(orm.compareAtPrice) : null,
      orm.stockQuantity,
      orm.imageUrl,
      orm.sellingUnitId,
      orm.unitQuantity ? Number(orm.unitQuantity) : null,
      orm.isActive,
      expiryDate,
      orm.createdAt,
      orm.updatedAt,
      orm.deletedAt,
      optionValueIds,
    );
  }

  static variantToOrm(domain: ProductVariant): ORMProductVariant {
    const orm = new ORMProductVariant();
    orm.id = domain.id;
    orm.productId = domain.productId;
    orm.sku = domain.sku;
    orm.name = domain.name;
    orm.price = domain.price;
    orm.compareAtPrice = domain.compareAtPrice;
    orm.stockQuantity = domain.stockQuantity;
    orm.imageUrl = domain.imageUrl;
    orm.sellingUnitId = domain.sellingUnitId;
    orm.unitQuantity =
      domain.unitQuantity !== null ? String(domain.unitQuantity) : null;
    orm.isActive = domain.isActive;
    orm.expiryDate = domain.expiryDate;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    orm.deletedAt = domain.deletedAt;
    return orm;
  }

  // ======================== VARIANT OPTION ========================

  static variantOptionToOrm(
    variantId: string,
    optionValueId: string,
  ): ORMProductVariantOption {
    const orm = new ORMProductVariantOption();
    orm.id = require('uuid').v7();
    orm.variantId = variantId;
    orm.optionValueId = optionValueId;
    orm.createdAt = new Date();
    return orm;
  }
}

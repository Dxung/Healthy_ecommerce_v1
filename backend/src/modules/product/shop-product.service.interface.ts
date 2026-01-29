import type { ResultAsync } from 'neverthrow';
import type { Product } from './models/product.model';
import type { ProductImage } from './models/product-image.model';
import type { ProductVariant } from './models/product-variant.model';
import type { DomainError } from 'src/shared/types/domain-error.type';
import type { CreateProductArgumentDto } from './dto/product/create-product-argument.dto';
import type { UpdateProductArgumentDto } from './dto/product/update-product-argument.dto';
import type { CreateVariantArgumentDto } from './dto/product/create-variant-argument.dto';
import type { UpdateVariantArgumentDto } from './dto/product/update-variant-argument.dto';
import type { PaginatedResult, PaginationParams } from 'src/shared/types/pagination.type';
import type { ProductStatus } from 'src/database/typeorm/entities/product/enums/product-status.enum';

/**
 * Unit info for display purposes.
 */
export interface UnitInfoData {
  id: string;
  name: string;
  symbol: string;
}

/**
 * Product detail with resolved unit information.
 */
export interface ProductDetailResult {
  product: Product;
  servingUnit?: UnitInfoData | null;
  variantUnitMap: Map<string, UnitInfoData>;
}

/**
 * Filter options for shop owner's product queries.
 */
export interface ShopProductFilter {
  search?: string;
  categoryId?: string;
  status?: ProductStatus;
}

export interface IShopProductService {
  // ======================== PRODUCT CRUD ========================

  /**
   * Gets all products owned by the current user's shop.
   * Requires AuthGuard to set userId in ALS.
   * @param filter - Optional filter criteria.
   * @param pagination - Pagination parameters.
   * @returns Paginated list of products.
   */
  getMyProducts(
    filter?: ShopProductFilter,
    pagination?: PaginationParams,
  ): ResultAsync<PaginatedResult<Product>, DomainError>;

  /**
   * Gets a product by ID (must be owned by current user's shop).
   * Requires AuthGuard to set userId in ALS.
   * @param productId - The product ID.
   * @returns The product with full details (images, options, variants).
   */
  getMyProductById(productId: string): ResultAsync<Product, DomainError>;

  /**
   * Gets a product by ID with resolved unit information.
   * Requires AuthGuard to set userId in ALS.
   * @param productId - The product ID.
   * @returns The product with unit info for display.
   */
  getMyProductDetailById(
    productId: string,
  ): ResultAsync<ProductDetailResult, DomainError>;

  /**
   * Creates a new product for the current user's shop.
   * Requires AuthGuard to set userId in ALS.
   * @param dto - Create product DTO with options and variants.
   * @returns The created product.
   */
  createProduct(dto: CreateProductArgumentDto): ResultAsync<Product, DomainError>;

  /**
   * Updates a product owned by the current user's shop.
   * Requires AuthGuard to set userId in ALS.
   * @param productId - The product ID.
   * @param dto - Update product DTO.
   * @returns The updated product.
   */
  updateProduct(
    productId: string,
    dto: UpdateProductArgumentDto,
  ): ResultAsync<Product, DomainError>;

  /**
   * Deletes a product owned by the current user's shop.
   * Requires AuthGuard to set userId in ALS.
   * @param productId - The product ID.
   * @returns void on success.
   */
  deleteProduct(productId: string): ResultAsync<void, DomainError>;

  // ======================== PUBLISH / ACTIVATE / DEACTIVATE ========================

  /**
   * Publishes a product (draft -> active).
   * Requires at least 1 active variant with stock > 0.
   * @param productId - The product ID.
   * @returns The updated product.
   */
  publishProduct(productId: string): ResultAsync<Product, DomainError>;

  /**
   * Deactivates a product (active -> inactive).
   * Once published, a product cannot go back to draft.
   * @param productId - The product ID.
   * @returns The updated product.
   */
  deactivateProduct(productId: string): ResultAsync<Product, DomainError>;

  /**
   * Activates a product (inactive -> active).
   * @param productId - The product ID.
   * @returns The updated product.
   */
  activateProduct(productId: string): ResultAsync<Product, DomainError>;

  // ======================== IMAGE MANAGEMENT ========================

  /**
   * Uploads an image to Cloudinary and returns the URL.
   * Uses the Healthy_product_image preset.
   * @param file - The uploaded file (validated by FileValidationPipe).
   * @returns The uploaded image URL.
   */
  uploadImage(file: Express.Multer.File): ResultAsync<string, DomainError>;

  /**
   * Adds an image to a product.
   * @param productId - The product ID.
   * @param imageUrl - The image URL.
   * @returns The created image.
   */
  addImage(productId: string, imageUrl: string): ResultAsync<ProductImage, DomainError>;

  /**
   * Removes an image from a product.
   * @param productId - The product ID.
   * @param imageId - The image ID.
   * @returns void on success.
   */
  removeImage(productId: string, imageId: string): ResultAsync<void, DomainError>;

  /**
   * Reorders product images.
   * @param productId - The product ID.
   * @param imageIds - Image IDs in the new order.
   * @returns void on success.
   */
  reorderImages(productId: string, imageIds: string[]): ResultAsync<void, DomainError>;

  // ======================== VARIANT MANAGEMENT ========================

  /**
   * Adds a variant to a product.
   * @param productId - The product ID.
   * @param dto - Create variant DTO.
   * @returns The created variant.
   */
  addVariant(
    productId: string,
    dto: CreateVariantArgumentDto,
  ): ResultAsync<ProductVariant, DomainError>;

  /**
   * Updates a variant.
   * @param productId - The product ID.
   * @param variantId - The variant ID.
   * @param dto - Update variant DTO.
   * @returns The updated variant.
   */
  updateVariant(
    productId: string,
    variantId: string,
    dto: UpdateVariantArgumentDto,
  ): ResultAsync<ProductVariant, DomainError>;

  /**
   * Deletes a variant (soft delete).
   * Cannot delete the last active variant.
   * @param productId - The product ID.
   * @param variantId - The variant ID.
   * @returns void on success.
   */
  deleteVariant(productId: string, variantId: string): ResultAsync<void, DomainError>;
}

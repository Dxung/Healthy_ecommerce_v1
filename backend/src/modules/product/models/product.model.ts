import { v7 as uuidv7 } from 'uuid';
import { Result, ok, err } from 'neverthrow';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { ProductStatus } from 'src/database/typeorm/entities/product/enums/product-status.enum';
import { ProductImage } from './product-image.model';
import { ProductIngredient } from './product-ingredient.model';
import { ProductOption } from './product-option.model';
import { ProductVariant } from './product-variant.model';

// Error codes for product operations (will be defined in product.errors.ts)
const PRODUCT_ERRORS = {
  CANNOT_PUBLISH: {
    code: 'PRODUCT_CANNOT_PUBLISH',
    message: 'Không thể đăng bán sản phẩm. Cần có ít nhất 1 biến thể còn hàng.',
  },
  CANNOT_EDIT: {
    code: 'PRODUCT_CANNOT_EDIT',
    message: 'Không thể chỉnh sửa sản phẩm ở trạng thái hiện tại.',
  },
  ALREADY_ACTIVE: {
    code: 'PRODUCT_ALREADY_ACTIVE',
    message: 'Sản phẩm đã đang hoạt động.',
  },
  ALREADY_INACTIVE: {
    code: 'PRODUCT_ALREADY_INACTIVE',
    message: 'Sản phẩm đã ở trạng thái tạm dừng.',
  },
  ALREADY_DRAFT: {
    code: 'PRODUCT_ALREADY_DRAFT',
    message: 'Sản phẩm đã ở trạng thái nháp.',
  },
  CANNOT_DEACTIVATE: {
    code: 'PRODUCT_CANNOT_DEACTIVATE',
    message: 'Chỉ có thể tạm dừng sản phẩm đang hoạt động.',
  },
  CANNOT_ACTIVATE: {
    code: 'PRODUCT_CANNOT_ACTIVATE',
    message: 'Chỉ có thể kích hoạt lại sản phẩm đang tạm dừng.',
  },
  IMAGE_NOT_FOUND: {
    code: 'IMAGE_NOT_FOUND',
    message: 'Không tìm thấy ảnh sản phẩm.',
  },
} as const;

/**
 * Domain model for Product.
 * Aggregate root containing images, options, and variants.
 */
export class Product {
  private _images: ProductImage[] = [];
  private _ingredients: ProductIngredient[] = [];
  private _options: ProductOption[] = [];
  private _variants: ProductVariant[] = [];

  constructor(
    private readonly _id: string,
    private readonly _shopId: string,
    private _categoryId: string,
    private _brandId: string | null,
    private _name: string,
    private _slug: string,
    private _description: string | null,
    private _thumbnailUrl: string,
    private _minPrice: number,
    private _maxPrice: number,
    private _totalSold: number,
    private _averageRating: number,
    private _totalRatings: number,
    private _isOfficialApproved: boolean,
    private _isVisible: boolean,
    private _servingSize: number | null,
    private _servingUnitId: string | null,
    private _status: ProductStatus,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _deletedAt: Date | null,
    images?: ProductImage[],
    ingredients?: ProductIngredient[],
    options?: ProductOption[],
    variants?: ProductVariant[],
  ) {
    if (images) this._images = images;
    if (ingredients) this._ingredients = ingredients;
    if (options) this._options = options;
    if (variants) this._variants = variants;
  }

  // ======================== FACTORY METHODS ========================

  /**
   * Creates a new product (draft status).
   * @param params.id - Optional pre-generated UUID. If not provided, a new one is generated.
   */
  static create(params: {
    id?: string;
    shopId: string;
    categoryId: string;
    brandId?: string | null;
    name: string;
    slug: string;
    description?: string | null;
    thumbnailUrl: string;
    servingSize?: number | null;
    servingUnitId?: string | null;
  }): Product {
    const now = new Date();
    return new Product(
      params.id ?? uuidv7(),
      params.shopId,
      params.categoryId,
      params.brandId ?? null,
      params.name,
      params.slug,
      params.description ?? null,
      params.thumbnailUrl,
      0, // minPrice - calculated from variants
      0, // maxPrice - calculated from variants
      0, // totalSold
      0, // averageRating
      0, // totalRatings
      false, // isOfficialApproved
      true, // isVisible
      params.servingSize ?? null,
      params.servingUnitId ?? null,
      ProductStatus.DRAFT,
      now,
      now,
      null,
      [], // images
      [], // ingredients
      [], // options
      [], // variants
    );
  }

  // ======================== BUSINESS RULES ========================

  /**
   * Checks if product can be published.
   * Must have at least 1 active variant with stock > 0.
   */
  canBePublished(): boolean {
    return this._variants.some((v) => v.isActive && v.isInStock());
  }

  /**
   * Checks if product can be edited.
   * Can edit: DRAFT, ACTIVE, INACTIVE
   * Cannot edit: DELETED, SUSPENDED
   */
  canBeEdited(): boolean {
    return (
      this._status !== ProductStatus.DELETED &&
      this._status !== ProductStatus.SUSPENDED
    );
  }

  /**
   * Checks if product is owned by the given shop.
   */
  isOwnedByShop(shopId: string): boolean {
    return this._shopId === shopId;
  }

  /**
   * Checks if product is visible to buyers.
   */
  isVisibleToBuyers(): boolean {
    return (
      this._status === ProductStatus.ACTIVE &&
      this._isVisible &&
      !this._deletedAt
    );
  }

  // ======================== STATUS MANAGEMENT ========================

  /**
   * Publishes the product (draft -> active).
   */
  publish(): Result<void, DomainError> {
    if (this._status === ProductStatus.ACTIVE) {
      return err(createDomainError(PRODUCT_ERRORS.ALREADY_ACTIVE));
    }
    if (!this.canBePublished()) {
      return err(createDomainError(PRODUCT_ERRORS.CANNOT_PUBLISH));
    }
    this._status = ProductStatus.ACTIVE;
    this._updatedAt = new Date();
    return ok(undefined);
  }

  /**
   * Deactivates the product (active -> inactive).
   * Once published, a product cannot go back to draft.
   */
  deactivate(): Result<void, DomainError> {
    if (this._status === ProductStatus.INACTIVE) {
      return err(createDomainError(PRODUCT_ERRORS.ALREADY_INACTIVE));
    }
    if (this._status !== ProductStatus.ACTIVE) {
      return err(createDomainError(PRODUCT_ERRORS.CANNOT_DEACTIVATE));
    }
    this._status = ProductStatus.INACTIVE;
    this._updatedAt = new Date();
    return ok(undefined);
  }

  /**
   * Activates the product (inactive -> active).
   */
  activate(): Result<void, DomainError> {
    if (this._status === ProductStatus.ACTIVE) {
      return err(createDomainError(PRODUCT_ERRORS.ALREADY_ACTIVE));
    }
    if (this._status !== ProductStatus.INACTIVE) {
      return err(createDomainError(PRODUCT_ERRORS.CANNOT_ACTIVATE));
    }
    this._status = ProductStatus.ACTIVE;
    this._updatedAt = new Date();
    return ok(undefined);
  }

  /**
   * Checks if product can be hard deleted.
   * Only DRAFT products can be hard deleted.
   */
  canBeHardDeleted(): boolean {
    return this._status === ProductStatus.DRAFT;
  }

  /**
   * Suspends the product (admin action).
   */
  suspend(): void {
    this._status = ProductStatus.SUSPENDED;
    this._updatedAt = new Date();
  }

  /**
   * Unsuspends the product (admin action).
   * Returns to draft status.
   */
  unsuspend(): void {
    this._status = ProductStatus.DRAFT;
    this._updatedAt = new Date();
  }

  /**
   * Soft deletes the product.
   */
  softDelete(): void {
    this._status = ProductStatus.DELETED;
    this._deletedAt = new Date();
    this._updatedAt = new Date();
  }

  // ======================== PRICE CALCULATION ========================

  /**
   * Recalculates min/max price from variants.
   * Should be called after adding/updating variants.
   */
  recalculatePriceRange(): void {
    const activeVariants = this._variants.filter((v) => v.isActive);
    if (activeVariants.length === 0) {
      this._minPrice = 0;
      this._maxPrice = 0;
      return;
    }

    const prices = activeVariants.map((v) => v.price);
    this._minPrice = Math.min(...prices);
    this._maxPrice = Math.max(...prices);
    this._updatedAt = new Date();
  }

  // ======================== IMAGE MANAGEMENT ========================

  addImage(image: ProductImage): void {
    this._images.push(image);
    this._updatedAt = new Date();
  }

  removeImage(imageId: string): Result<void, DomainError> {
    const index = this._images.findIndex((img) => img.id === imageId);
    if (index === -1) {
      return err(createDomainError(PRODUCT_ERRORS.IMAGE_NOT_FOUND));
    }
    this._images.splice(index, 1);
    this._updatedAt = new Date();
    return ok(undefined);
  }

  setImages(images: ProductImage[]): void {
    this._images = images;
  }

  // ======================== INGREDIENT MANAGEMENT ========================

  setIngredients(ingredients: ProductIngredient[]): void {
    this._ingredients = ingredients;
  }

  addIngredient(ingredient: ProductIngredient): void {
    this._ingredients.push(ingredient);
    this._updatedAt = new Date();
  }

  // ======================== OPTION/VARIANT MANAGEMENT ========================

  setOptions(options: ProductOption[]): void {
    this._options = options;
  }

  setVariants(variants: ProductVariant[]): void {
    this._variants = variants;
    this.recalculatePriceRange();
  }

  addVariant(variant: ProductVariant): void {
    this._variants.push(variant);
    this.recalculatePriceRange();
  }

  // ======================== UPDATE METHODS ========================

  updateInfo(params: {
    categoryId?: string;
    brandId?: string | null;
    name?: string;
    slug?: string;
    description?: string | null;
    thumbnailUrl?: string;
    isVisible?: boolean;
    servingSize?: number | null;
    servingUnitId?: string | null;
  }): Result<void, DomainError> {
    if (!this.canBeEdited()) {
      return err(createDomainError(PRODUCT_ERRORS.CANNOT_EDIT));
    }

    if (params.categoryId !== undefined) this._categoryId = params.categoryId;
    if (params.brandId !== undefined) this._brandId = params.brandId;
    if (params.name !== undefined) this._name = params.name;
    if (params.slug !== undefined) this._slug = params.slug;
    if (params.description !== undefined)
      this._description = params.description;
    if (params.thumbnailUrl !== undefined)
      this._thumbnailUrl = params.thumbnailUrl;
    if (params.isVisible !== undefined) this._isVisible = params.isVisible;
    if (params.servingSize !== undefined)
      this._servingSize = params.servingSize;
    if (params.servingUnitId !== undefined)
      this._servingUnitId = params.servingUnitId;

    this._updatedAt = new Date();
    return ok(undefined);
  }

  setThumbnail(thumbnailUrl: string): void {
    this._thumbnailUrl = thumbnailUrl;
    this._updatedAt = new Date();
  }

  // ======================== GETTERS ========================

  get id(): string {
    return this._id;
  }

  get shopId(): string {
    return this._shopId;
  }

  get categoryId(): string {
    return this._categoryId;
  }

  get brandId(): string | null {
    return this._brandId;
  }

  get name(): string {
    return this._name;
  }

  get slug(): string {
    return this._slug;
  }

  get description(): string | null {
    return this._description;
  }

  get thumbnailUrl(): string {
    return this._thumbnailUrl;
  }

  get minPrice(): number {
    return this._minPrice;
  }

  get maxPrice(): number {
    return this._maxPrice;
  }

  get totalSold(): number {
    return this._totalSold;
  }

  /**
   * Increments the total sold count for this product.
   * Called when an order containing this product is completed.
   */
  incrementSoldCount(quantity: number): void {
    this._totalSold += quantity;
    this._updatedAt = new Date();
  }

  get averageRating(): number {
    return this._averageRating;
  }

  get totalRatings(): number {
    return this._totalRatings;
  }

  get isOfficialApproved(): boolean {
    return this._isOfficialApproved;
  }

  get isVisible(): boolean {
    return this._isVisible;
  }

  get servingSize(): number | null {
    return this._servingSize;
  }

  get servingUnitId(): string | null {
    return this._servingUnitId;
  }

  get status(): ProductStatus {
    return this._status;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get deletedAt(): Date | null {
    return this._deletedAt;
  }

  get images(): ProductImage[] {
    return this._images;
  }

  get ingredients(): ProductIngredient[] {
    return this._ingredients;
  }

  get options(): ProductOption[] {
    return this._options;
  }

  get variants(): ProductVariant[] {
    return this._variants;
  }
}

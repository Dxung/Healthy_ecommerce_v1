import type { ResultAsync } from 'neverthrow';
import type { ProductImage } from '../models/product-image.model';
import type { DomainError } from 'src/shared/types/domain-error.type';

export interface IProductImageRepository {
  /**
   * Adds an image to a product.
   * @param image - The ProductImage domain model to add.
   * @returns The created ProductImage domain model.
   */
  addImage(image: ProductImage): ResultAsync<ProductImage, DomainError>;

  /**
   * Removes an image.
   * @param imageId - The image ID to remove.
   * @returns void on success.
   */
  removeImage(imageId: string): ResultAsync<void, DomainError>;

  /**
   * Updates the sort order of images.
   * @param productId - The product ID.
   * @param imageOrders - Array of { imageId, sortOrder } pairs.
   * @returns void on success.
   */
  reorderImages(
    productId: string,
    imageOrders: Array<{ imageId: string; sortOrder: number }>,
  ): ResultAsync<void, DomainError>;

  /**
   * Gets the count of images for a product.
   * @param productId - The product ID.
   * @returns The number of images.
   */
  getImageCount(productId: string): ResultAsync<number, DomainError>;

  /**
   * Finds an image by its ID.
   * @param imageId - The image ID.
   * @returns The ProductImage domain model or null if not found.
   */
  findById(imageId: string): ResultAsync<ProductImage | null, DomainError>;

  /**
   * Gets all images for a product.
   * @param productId - The product ID.
   * @returns Array of ProductImage domain models.
   */
  findByProductId(productId: string): ResultAsync<ProductImage[], DomainError>;
}

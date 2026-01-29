import type { ResultAsync } from 'neverthrow';
import type { Review } from '../models/review.model';
import type { ReviewImage } from '../models/review-image.model';
import type { ReviewReply } from '../models/review-reply.model';
import type { DomainError } from 'src/shared/types/domain-error.type';
import type {
  PaginationParams,
  PaginatedResult,
} from 'src/shared/types/pagination.type';

/**
 * Options for loading review relations.
 */
export interface ReviewLoadOptions {
  withImages?: boolean;
  withReply?: boolean;
  withUser?: boolean;
}

/**
 * Result of rating calculation
 */
export interface RatingResult {
  averageRating: number;
  totalRatings: number;
}

export interface IReviewRepository {
  /**
   * Finds a review by its ID with optional relations.
   * @param id - The review ID.
   * @param options - Optional relation loading options.
   * @returns The Review domain model or null if not found.
   */
  findById(
    id: string,
    options?: ReviewLoadOptions,
  ): ResultAsync<Review | null, DomainError>;

  /**
   * Finds a review by order item ID.
   * @param orderItemId - The order item ID.
   * @param options - Optional relation loading options.
   * @returns The Review domain model or null if not found.
   */
  findByOrderItemId(
    orderItemId: string,
    options?: ReviewLoadOptions,
  ): ResultAsync<Review | null, DomainError>;

  /**
   * Finds all reviews for a product with pagination.
   * Only returns active reviews (excludes hidden and deleted).
   * @param productId - The product ID.
   * @param pagination - Pagination parameters.
   * @param options - Optional relation loading options.
   * @param rating - Optional filter by star rating (1-5).
   * @returns Paginated list of Review domain models.
   */
  findByProductId(
    productId: string,
    pagination: PaginationParams,
    options?: ReviewLoadOptions,
    rating?: number,
  ): ResultAsync<PaginatedResult<Review>, DomainError>;

  /**
   * Finds all reviews for a shop with pagination.
   * Only returns active reviews (excludes hidden and deleted).
   * @param shopId - The shop ID.
   * @param pagination - Pagination parameters.
   * @param options - Optional relation loading options.
   * @returns Paginated list of Review domain models.
   */
  findByShopId(
    shopId: string,
    pagination: PaginationParams,
    options?: ReviewLoadOptions,
  ): ResultAsync<PaginatedResult<Review>, DomainError>;

  /**
   * Finds all reviews by a user with pagination.
   * Includes all statuses for the user's own reviews.
   * @param userId - The user ID.
   * @param pagination - Pagination parameters.
   * @param options - Optional relation loading options.
   * @returns Paginated list of Review domain models.
   */
  findByUserId(
    userId: string,
    pagination: PaginationParams,
    options?: ReviewLoadOptions,
  ): ResultAsync<PaginatedResult<Review>, DomainError>;

  /**
   * Creates a new review with its images.
   * @param review - The Review domain model to create.
   * @returns The created Review domain model.
   */
  create(review: Review): ResultAsync<Review, DomainError>;

  /**
   * Updates an existing review.
   * @param review - The Review domain model with updated fields.
   * @returns The updated Review domain model.
   */
  update(review: Review): ResultAsync<Review, DomainError>;

  /**
   * Updates review images (deletes existing and creates new).
   * @param reviewId - The review ID.
   * @param images - The new images to set.
   * @returns void on success.
   */
  updateImages(
    reviewId: string,
    images: ReviewImage[],
  ): ResultAsync<void, DomainError>;

  /**
   * Calculates the average rating and total count for a product.
   * Only counts active reviews (excludes hidden and deleted).
   * @param productId - The product ID.
   * @returns The average rating and total count.
   */
  calculateProductRating(productId: string): ResultAsync<RatingResult, DomainError>;

  /**
   * Calculates the average rating and total count for a shop.
   * Only counts active reviews (excludes hidden and deleted).
   * @param shopId - The shop ID.
   * @returns The average rating and total count.
   */
  calculateShopRating(shopId: string): ResultAsync<RatingResult, DomainError>;

  // ======================== REPLY OPERATIONS ========================

  /**
   * Finds a review reply by review ID.
   * @param reviewId - The review ID.
   * @returns The ReviewReply domain model or null if not found.
   */
  findReplyByReviewId(reviewId: string): ResultAsync<ReviewReply | null, DomainError>;

  /**
   * Finds a review reply by its ID.
   * @param id - The reply ID.
   * @returns The ReviewReply domain model or null if not found.
   */
  findReplyById(id: string): ResultAsync<ReviewReply | null, DomainError>;

  /**
   * Creates a new review reply.
   * @param reply - The ReviewReply domain model to create.
   * @returns The created ReviewReply domain model.
   */
  createReply(reply: ReviewReply): ResultAsync<ReviewReply, DomainError>;

  /**
   * Updates an existing review reply.
   * @param reply - The ReviewReply domain model with updated fields.
   * @returns The updated ReviewReply domain model.
   */
  updateReply(reply: ReviewReply): ResultAsync<ReviewReply, DomainError>;

  /**
   * Deletes a review reply.
   * @param id - The reply ID to delete.
   * @returns void on success.
   */
  deleteReply(id: string): ResultAsync<void, DomainError>;
}

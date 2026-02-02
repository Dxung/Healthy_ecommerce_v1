import type { ResultAsync } from 'neverthrow';
import type { Review } from './models/review.model';
import type { ReviewReply } from './models/review-reply.model';
import type { DomainError } from 'src/shared/types/domain-error.type';
import type { PaginatedResult } from 'src/shared/types/pagination.type';

/**
 * Interface for Review service.
 * Handles all review-related business logic.
 */
export interface IReviewService {
  // ======================== BUYER REVIEW OPERATIONS ========================

  /**
   * Creates a new review for an order item.
   * Business rules:
   * - User must be authenticated (from ALS)
   * - Order item must exist
   * - User must be the buyer of the order
   * - Order status must be COMPLETED
   * - Order item refund status must be 'none'
   * - No existing review for this order item
   * - Current date must be within REVIEW_WINDOW_DAYS of order.completedAt
   *
   * @param orderItemId - The order item ID to review
   * @param rating - Rating from 1 to 5
   * @param content - Optional review text
   * @param imageUrls - Optional list of image URLs
   * @returns The created Review or DomainError
   */
  createReview(
    orderItemId: string,
    rating: number,
    content: string | null,
    imageUrls: string[],
  ): ResultAsync<Review, DomainError>;

  /**
   * Updates an existing review.
   * Business rules:
   * - Review must exist and status = 'active'
   * - User must be the review owner
   * - Within review window (REVIEW_WINDOW_DAYS from order.completedAt)
   *
   * @param reviewId - The review ID to update
   * @param rating - Optional new rating
   * @param content - Optional new content
   * @param imageUrls - Optional new image URLs (replaces existing)
   * @returns The updated Review or DomainError
   */
  updateReview(
    reviewId: string,
    rating?: number,
    content?: string | null,
    imageUrls?: string[],
  ): ResultAsync<Review, DomainError>;

  /**
   * Soft deletes a review.
   * Sets status to 'deleted' and deletedAt timestamp.
   * Recalculates product and shop ratings.
   *
   * @param reviewId - The review ID to delete
   * @returns void or DomainError
   */
  deleteReview(reviewId: string): ResultAsync<void, DomainError>;

  /**
   * Gets a review by its order item ID.
   *
   * @param orderItemId - The order item ID
   * @returns The Review or null if not found
   */
  getReviewByOrderItemId(
    orderItemId: string,
  ): ResultAsync<Review | null, DomainError>;

  /**
   * Gets all reviews for a product (paginated).
   * Only returns active reviews (excludes hidden and deleted).
   *
   * @param productId - The product ID
   * @param page - Page number
   * @param limit - Items per page
   * @param rating - Optional filter by star rating (1-5)
   * @param hasContent - Optional filter for reviews with content
   * @param hasImages - Optional filter for reviews with images
   * @returns Paginated list of Reviews
   */
  getProductReviews(
    productId: string,
    page: number,
    limit: number,
    rating?: number,
    hasContent?: boolean,
    hasImages?: boolean,
  ): ResultAsync<PaginatedResult<Review>, DomainError>;

  /**
   * Gets all reviews by the current user (paginated).
   * Includes all statuses for the user's own reviews.
   * Requires AuthGuard to set userId in ALS.
   *
   * @param page - Page number
   * @param limit - Items per page
   * @returns Paginated list of Reviews
   */
  getMyReviews(
    page: number,
    limit: number,
  ): ResultAsync<PaginatedResult<Review>, DomainError>;

  /**
   * Checks if the current user can review an order item.
   * Returns canReview: true if all conditions are met, otherwise false with reason.
   * Requires AuthGuard to set userId in ALS.
   *
   * @param orderItemId - The order item ID to check
   * @returns { canReview: boolean, reason?: string }
   */
  canReviewOrderItem(
    orderItemId: string,
  ): ResultAsync<{ canReview: boolean; reason?: string }, DomainError>;

  // ======================== REFUND INTEGRATION ========================

  /**
   * Called when an order item is refunded.
   * Hides the review (if exists) and recalculates ratings.
   *
   * @param orderItemId - The refunded order item ID
   * @returns void or DomainError
   */
  onItemRefunded(orderItemId: string): ResultAsync<void, DomainError>;

  /**
   * Recalculates the average rating for a product.
   * Only counts active reviews (excludes hidden and deleted).
   *
   * @param productId - The product ID
   * @returns void or DomainError
   */
  recalculateProductRating(productId: string): ResultAsync<void, DomainError>;

  /**
   * Recalculates the average rating for a shop.
   * Only counts active reviews (excludes hidden and deleted).
   *
   * @param shopId - The shop ID
   * @returns void or DomainError
   */
  recalculateShopRating(shopId: string): ResultAsync<void, DomainError>;

  // ======================== SHOP REPLY OPERATIONS ========================

  /**
   * Creates a reply to a review.
   * Business rules:
   * - Review must exist and be active
   * - User must own the shop that the review is for
   * - No existing reply for this review
   *
   * @param reviewId - The review ID to reply to
   * @param content - Reply text content
   * @returns The created ReviewReply or DomainError
   */
  createReviewReply(
    reviewId: string,
    content: string,
  ): ResultAsync<ReviewReply, DomainError>;

  /**
   * Updates a shop's reply to a review.
   *
   * @param reviewId - The review ID
   * @param content - New reply content
   * @returns The updated ReviewReply or DomainError
   */
  updateReviewReply(
    reviewId: string,
    content: string,
  ): ResultAsync<ReviewReply, DomainError>;

  /**
   * Deletes a shop's reply to a review.
   *
   * @param reviewId - The review ID
   * @returns void or DomainError
   */
  deleteReviewReply(reviewId: string): ResultAsync<void, DomainError>;

  // ======================== SHOP REVIEW MANAGEMENT ========================

  /**
   * Gets all reviews for a shop (paginated).
   * Used by shop owners to manage their reviews.
   * Requires AuthGuard to set userId in ALS.
   *
   * @param page - Page number
   * @param limit - Items per page
   * @returns Paginated list of Reviews
   */
  getShopReviews(
    page: number,
    limit: number,
  ): ResultAsync<PaginatedResult<Review>, DomainError>;
}

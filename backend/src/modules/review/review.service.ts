import { Inject, Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { ResultAsync, errAsync, okAsync } from 'neverthrow';
import { IReviewService } from './review.service.interface';
import { IReviewRepository } from './repository/review.repository.interface';
import { Review } from './models/review.model';
import { ReviewImage } from './models/review-image.model';
import { ReviewReply } from './models/review-reply.model';
import { REVIEW_ERRORS } from './errors/review.errors';
import { REVIEW_REPOSITORY } from 'src/database/typeorm/tokens/database.token';
import { ORDER_REPOSITORY } from 'src/database/typeorm/tokens/database.token';
import { PRODUCT_REPOSITORY } from 'src/database/typeorm/tokens/database.token';
import { SHOP_REPOSITORY } from 'src/database/typeorm/tokens/database.token';
import { SYSTEM_CONFIG_REPOSITORY } from 'src/database/typeorm/tokens/database.token';
import type { IOrderRepository } from 'src/modules/order/repository/order.repository.interface';
import type { IProductRepository } from 'src/modules/product/repository/product.repository.interface';
import type { IShopRepository } from 'src/modules/shop/repository/shop.repository.interface';
import { ITypeORMAlsStore } from 'src/shared/als/interfaces/als-store.interface';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { SHARED_ERRORS } from 'src/shared/errors/shared.errors';
import { PaginatedResult } from 'src/shared/types/pagination.type';
import { OrderStatus } from 'src/database/typeorm/entities/order/enums/order-status.enum';
import { CONFIG_KEYS, DEFAULT_CONFIG } from 'src/modules/system-config/system-config.constants';
import type { ISystemConfigService } from 'src/modules/system-config/system-config.service.interface';
import { SYSTEM_CONFIG_SERVICE } from 'src/modules/system-config/tokens/system-config.token';

@Injectable()
export class ReviewService implements IReviewService {
  constructor(
    @Inject(REVIEW_REPOSITORY)
    private readonly reviewRepository: IReviewRepository,
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(SHOP_REPOSITORY)
    private readonly shopRepository: IShopRepository,
    @Inject(SYSTEM_CONFIG_SERVICE)
    private readonly systemConfigService: ISystemConfigService,
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
  ) {}

  // ======================== BUYER REVIEW OPERATIONS ========================

  @WithPosition()
  createReview(
    orderItemId: string,
    rating: number,
    content: string | null,
    imageUrls: string[],
  ): ResultAsync<Review, DomainError> {
    const userId = this.getUserId();
    if (!userId) {
      return errAsync(
        createDomainError(SHARED_ERRORS.SYSTEM_ERROR, {
          cause: 'User ID not found in ALS',
        }),
      );
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return errAsync(createDomainError(REVIEW_ERRORS.INVALID_RATING));
    }

    // Check if user can review
    return this.canReviewOrderItem(orderItemId).andThen((canReviewResult) => {
      if (!canReviewResult.canReview) {
        // Map reason to appropriate error
        return errAsync(this.getCanReviewError(canReviewResult.reason));
      }

      // Get order item with order to get product and shop IDs
      return this.orderRepository.findOrderItemById(orderItemId).andThen((result) => {
        if (!result) {
          return errAsync(createDomainError(REVIEW_ERRORS.ORDER_ITEM_NOT_FOUND));
        }

        const { item, order } = result;

        // Create review
        const review = Review.create({
          orderItemId,
          userId,
          productId: item.productId,
          shopId: order.shopId,
          rating,
          content,
          imageUrls,
        });

        // Save review
        return this.reviewRepository.create(review).andThen((savedReview) => {
          // Recalculate ratings
          return this.recalculateProductRating(savedReview.productId)
            .andThen(() => this.recalculateShopRating(savedReview.shopId))
            .map(() => savedReview);
        });
      });
    });
  }

  @WithPosition()
  updateReview(
    reviewId: string,
    rating?: number,
    content?: string | null,
    imageUrls?: string[],
  ): ResultAsync<Review, DomainError> {
    const userId = this.getUserId();
    if (!userId) {
      return errAsync(
        createDomainError(SHARED_ERRORS.SYSTEM_ERROR, {
          cause: 'User ID not found in ALS',
        }),
      );
    }

    // Validate rating if provided
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return errAsync(createDomainError(REVIEW_ERRORS.INVALID_RATING));
    }

    return this.reviewRepository
      .findById(reviewId, { withImages: true, withReply: true })
      .andThen((review) => {
        if (!review) {
          return errAsync(createDomainError(REVIEW_ERRORS.REVIEW_NOT_FOUND));
        }

        // Check ownership
        if (!review.isOwnedBy(userId)) {
          return errAsync(createDomainError(REVIEW_ERRORS.NOT_REVIEW_OWNER));
        }

        // Check if review can be modified
        if (!review.canBeModified()) {
          return errAsync(createDomainError(REVIEW_ERRORS.REVIEW_CANNOT_MODIFY));
        }

        // Check review window
        return this.isWithinReviewWindow(review.orderItemId).andThen(
          (isWithin) => {
            if (!isWithin) {
              return errAsync(
                createDomainError(REVIEW_ERRORS.REVIEW_WINDOW_EXPIRED),
              );
            }

            // Update review
            review.update(rating, content);

            // Update images if provided
            const updateImagesResult =
              imageUrls !== undefined
                ? this.updateReviewImages(reviewId, imageUrls)
                : okAsync(undefined);

            return updateImagesResult.andThen(() =>
              this.reviewRepository.update(review).andThen((updatedReview) => {
                // Recalculate ratings if rating changed
                if (rating !== undefined) {
                  return this.recalculateProductRating(updatedReview.productId)
                    .andThen(() =>
                      this.recalculateShopRating(updatedReview.shopId),
                    )
                    .map(() => updatedReview);
                }
                return okAsync(updatedReview);
              }),
            );
          },
        );
      });
  }

  @WithPosition()
  deleteReview(reviewId: string): ResultAsync<void, DomainError> {
    const userId = this.getUserId();
    if (!userId) {
      return errAsync(
        createDomainError(SHARED_ERRORS.SYSTEM_ERROR, {
          cause: 'User ID not found in ALS',
        }),
      );
    }

    return this.reviewRepository
      .findById(reviewId, { withImages: false })
      .andThen((review) => {
        if (!review) {
          return errAsync(createDomainError(REVIEW_ERRORS.REVIEW_NOT_FOUND));
        }

        // Check ownership
        if (!review.isOwnedBy(userId)) {
          return errAsync(createDomainError(REVIEW_ERRORS.NOT_REVIEW_OWNER));
        }

        // Check if review can be modified
        if (!review.canBeModified()) {
          return errAsync(createDomainError(REVIEW_ERRORS.REVIEW_CANNOT_MODIFY));
        }

        // Check review window
        return this.isWithinReviewWindow(review.orderItemId).andThen(
          (isWithin) => {
            if (!isWithin) {
              return errAsync(
                createDomainError(REVIEW_ERRORS.REVIEW_WINDOW_EXPIRED),
              );
            }

            // Soft delete
            review.softDelete();

            return this.reviewRepository.update(review).andThen(() => {
              // Recalculate ratings
              return this.recalculateProductRating(review.productId)
                .andThen(() => this.recalculateShopRating(review.shopId))
                .map(() => undefined);
            });
          },
        );
      });
  }

  @WithPosition()
  getReviewByOrderItemId(
    orderItemId: string,
  ): ResultAsync<Review | null, DomainError> {
    return this.reviewRepository.findByOrderItemId(orderItemId, {
      withImages: true,
      withReply: true,
    });
  }

  @WithPosition()
  getProductReviews(
    productId: string,
    page: number,
    limit: number,
    rating?: number,
  ): ResultAsync<PaginatedResult<Review>, DomainError> {
    return this.reviewRepository.findByProductId(
      productId,
      { page, limit },
      { withImages: true, withReply: true },
      rating,
    );
  }

  @WithPosition()
  getMyReviews(
    page: number,
    limit: number,
  ): ResultAsync<PaginatedResult<Review>, DomainError> {
    const userId = this.getUserId();
    if (!userId) {
      return errAsync(
        createDomainError(SHARED_ERRORS.SYSTEM_ERROR, {
          cause: 'User ID not found in ALS',
        }),
      );
    }

    return this.reviewRepository.findByUserId(
      userId,
      { page, limit },
      { withImages: true, withReply: true },
    );
  }

  @WithPosition()
  canReviewOrderItem(
    orderItemId: string,
  ): ResultAsync<{ canReview: boolean; reason?: string }, DomainError> {
    const userId = this.getUserId();
    if (!userId) {
      return okAsync({ canReview: false, reason: 'not_authenticated' });
    }

    // Get order item with order
    return this.orderRepository.findOrderItemById(orderItemId).andThen((result) => {
      if (!result) {
        return okAsync({ canReview: false, reason: 'order_item_not_found' });
      }

      const { item, order } = result;

      // Check buyer
      if (order.buyerId !== userId) {
        return okAsync({ canReview: false, reason: 'not_buyer' });
      }

      // Check order status
      if (order.status !== OrderStatus.COMPLETED) {
        return okAsync({ canReview: false, reason: 'order_not_completed' });
      }

      // Check refund status
      if (!item.canBeReviewed()) {
        return okAsync({ canReview: false, reason: 'item_refunded' });
      }

      // Check existing review
      return this.reviewRepository
        .findByOrderItemId(orderItemId)
        .andThen((existingReview) => {
          if (existingReview) {
            return okAsync({ canReview: false, reason: 'already_reviewed' });
          }

          // Check review window
          return this.isWithinReviewWindow(orderItemId).map((isWithin) => {
            if (!isWithin) {
              return { canReview: false, reason: 'window_expired' };
            }
            return { canReview: true };
          });
        });
    });
  }

  // ======================== REFUND INTEGRATION ========================

  @WithPosition()
  onItemRefunded(orderItemId: string): ResultAsync<void, DomainError> {
    return this.reviewRepository
      .findByOrderItemId(orderItemId, { withImages: false })
      .andThen((review) => {
        if (!review || !review.isActive()) {
          // No active review to hide
          return okAsync(undefined);
        }

        // Hide review
        review.hideForRefund();

        return this.reviewRepository.update(review).andThen(() => {
          // Recalculate ratings
          return this.recalculateProductRating(review.productId)
            .andThen(() => this.recalculateShopRating(review.shopId))
            .map(() => undefined);
        });
      });
  }

  @WithPosition()
  recalculateProductRating(productId: string): ResultAsync<void, DomainError> {
    return this.reviewRepository.calculateProductRating(productId).andThen(
      (result) =>
        this.productRepository.updateRating(
          productId,
          Math.round(result.averageRating * 100) / 100,
          result.totalRatings,
        ),
    );
  }

  @WithPosition()
  recalculateShopRating(shopId: string): ResultAsync<void, DomainError> {
    return this.reviewRepository.calculateShopRating(shopId).andThen((result) =>
      this.shopRepository.updateRating(
        shopId,
        Math.round(result.averageRating * 100) / 100,
        result.totalRatings,
      ),
    );
  }

  // ======================== SHOP REPLY OPERATIONS ========================

  @WithPosition()
  createReviewReply(
    reviewId: string,
    content: string,
  ): ResultAsync<ReviewReply, DomainError> {
    const userId = this.getUserId();
    if (!userId) {
      return errAsync(
        createDomainError(SHARED_ERRORS.SYSTEM_ERROR, {
          cause: 'User ID not found in ALS',
        }),
      );
    }

    return this.reviewRepository
      .findById(reviewId, { withReply: true })
      .andThen((review) => {
        if (!review) {
          return errAsync(createDomainError(REVIEW_ERRORS.REVIEW_NOT_FOUND));
        }

        // Check if review already has a reply
        if (review.reply) {
          return errAsync(createDomainError(REVIEW_ERRORS.REPLY_ALREADY_EXISTS));
        }

        // Verify user owns the shop
        return this.shopRepository.findByUserId(userId).andThen((shop) => {
          if (!shop || shop.id !== review.shopId) {
            return errAsync(createDomainError(REVIEW_ERRORS.NOT_SHOP_OWNER));
          }

          const reply = ReviewReply.create({
            reviewId,
            shopId: shop.id,
            content,
          });

          return this.reviewRepository.createReply(reply);
        });
      });
  }

  @WithPosition()
  updateReviewReply(
    reviewId: string,
    content: string,
  ): ResultAsync<ReviewReply, DomainError> {
    const userId = this.getUserId();
    if (!userId) {
      return errAsync(
        createDomainError(SHARED_ERRORS.SYSTEM_ERROR, {
          cause: 'User ID not found in ALS',
        }),
      );
    }

    return this.reviewRepository.findReplyByReviewId(reviewId).andThen((reply) => {
      if (!reply) {
        return errAsync(createDomainError(REVIEW_ERRORS.REPLY_NOT_FOUND));
      }

      // Verify user owns the shop
      return this.shopRepository.findByUserId(userId).andThen((shop) => {
        if (!shop || shop.id !== reply.shopId) {
          return errAsync(createDomainError(REVIEW_ERRORS.NOT_SHOP_OWNER));
        }

        reply.updateContent(content);
        return this.reviewRepository.updateReply(reply);
      });
    });
  }

  @WithPosition()
  deleteReviewReply(reviewId: string): ResultAsync<void, DomainError> {
    const userId = this.getUserId();
    if (!userId) {
      return errAsync(
        createDomainError(SHARED_ERRORS.SYSTEM_ERROR, {
          cause: 'User ID not found in ALS',
        }),
      );
    }

    return this.reviewRepository.findReplyByReviewId(reviewId).andThen((reply) => {
      if (!reply) {
        return errAsync(createDomainError(REVIEW_ERRORS.REPLY_NOT_FOUND));
      }

      // Verify user owns the shop
      return this.shopRepository.findByUserId(userId).andThen((shop) => {
        if (!shop || shop.id !== reply.shopId) {
          return errAsync(createDomainError(REVIEW_ERRORS.NOT_SHOP_OWNER));
        }

        return this.reviewRepository.deleteReply(reply.id);
      });
    });
  }

  // ======================== SHOP REVIEW MANAGEMENT ========================

  @WithPosition()
  getShopReviews(
    page: number,
    limit: number,
  ): ResultAsync<PaginatedResult<Review>, DomainError> {
    const userId = this.getUserId();
    if (!userId) {
      return errAsync(
        createDomainError(SHARED_ERRORS.SYSTEM_ERROR, {
          cause: 'User ID not found in ALS',
        }),
      );
    }

    return this.shopRepository.findByUserId(userId).andThen((shop) => {
      if (!shop) {
        return errAsync(createDomainError(REVIEW_ERRORS.SHOP_NOT_FOUND));
      }

      return this.reviewRepository.findByShopId(
        shop.id,
        { page, limit },
        { withImages: true, withReply: true },
      );
    });
  }

  // ======================== PRIVATE HELPERS ========================

  private getUserId(): string | undefined {
    const store = this.als.getStore();
    return store?.userId;
  }

  private async getReviewWindowDays(): Promise<number> {
    const result = await this.systemConfigService
      .getConfig(CONFIG_KEYS.REVIEW_WINDOW_DAYS)
      .match(
        (config) =>
          config ? parseInt(config.value, 10) : DEFAULT_CONFIG[CONFIG_KEYS.REVIEW_WINDOW_DAYS],
        () => DEFAULT_CONFIG[CONFIG_KEYS.REVIEW_WINDOW_DAYS],
      );
    return result;
  }

  private isWithinReviewWindow(
    orderItemId: string,
  ): ResultAsync<boolean, DomainError> {
    return this.orderRepository.findOrderItemById(orderItemId).andThen((result) => {
      if (!result) {
        return okAsync(false);
      }

      const { order } = result;
      if (!order.completedAt) {
        return okAsync(false);
      }

      return ResultAsync.fromPromise(
        this.getReviewWindowDays(),
        () => createDomainError(SHARED_ERRORS.SYSTEM_ERROR),
      ).map((days) => {
        const deadline = new Date(order.completedAt!);
        deadline.setDate(deadline.getDate() + days);
        return new Date() <= deadline;
      });
    });
  }

  private updateReviewImages(
    reviewId: string,
    imageUrls: string[],
  ): ResultAsync<void, DomainError> {
    const images = imageUrls.map((url, index) =>
      ReviewImage.create({
        reviewId,
        imageUrl: url,
        displayOrder: index,
      }),
    );
    return this.reviewRepository.updateImages(reviewId, images);
  }

  private getCanReviewError(reason?: string): DomainError {
    switch (reason) {
      case 'order_item_not_found':
        return createDomainError(REVIEW_ERRORS.ORDER_ITEM_NOT_FOUND);
      case 'not_buyer':
        return createDomainError(REVIEW_ERRORS.NOT_ORDER_BUYER);
      case 'order_not_completed':
        return createDomainError(REVIEW_ERRORS.ORDER_NOT_COMPLETED);
      case 'item_refunded':
        return createDomainError(REVIEW_ERRORS.ITEM_REFUNDED);
      case 'already_reviewed':
        return createDomainError(REVIEW_ERRORS.ALREADY_REVIEWED);
      case 'window_expired':
        return createDomainError(REVIEW_ERRORS.REVIEW_WINDOW_EXPIRED);
      default:
        return createDomainError(SHARED_ERRORS.SYSTEM_ERROR, { cause: reason });
    }
  }
}

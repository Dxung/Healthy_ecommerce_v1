import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { DataSource, In } from 'typeorm';
import { ResultAsync, okAsync } from 'neverthrow';
import { ITypeORMAlsStore } from 'src/shared/als/interfaces/als-store.interface';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { SHARED_ERRORS } from 'src/shared/errors/shared.errors';
import {
  IReviewRepository,
  ReviewLoadOptions,
  RatingResult,
  ProductReviewFilter,
} from 'src/modules/review/repository/review.repository.interface';
import {
  PaginationParams,
  PaginatedResult,
  createPaginatedResult,
} from 'src/shared/types/pagination.type';
import { Review } from 'src/modules/review/models/review.model';
import { ReviewImage } from 'src/modules/review/models/review-image.model';
import { ReviewReply } from 'src/modules/review/models/review-reply.model';
import { ReviewStatus } from '../../entities/product/enums/review-status.enum';
import {
  ORMReview,
  ORMReviewImage,
  ORMReviewReply,
} from '../../entities/product';
import { ORMReviewMapper } from '../../mappers/review.mapper.orm';
import {
  REVIEW_ALIAS,
  REVIEW_IMAGE_ALIAS,
  REVIEW_REPLY_ALIAS,
  ReviewColumn,
  QueryParam,
  ReviewRelation,
} from './review-query.constants';

@Injectable()
export class OrmReviewRepository implements IReviewRepository {
  constructor(
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
    private readonly dataSource: DataSource,
  ) {}

  @WithPosition()
  findById(
    id: string,
    options?: ReviewLoadOptions,
  ): ResultAsync<Review | null, DomainError> {
    const repo = this.getReviewRepository();
    const relations = this.buildRelations(options);

    return ResultAsync.fromPromise(
      repo.findOne({ where: { id }, relations }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orm) => (orm ? ORMReviewMapper.toDomain(orm) : null));
  }

  @WithPosition()
  findByOrderItemId(
    orderItemId: string,
    options?: ReviewLoadOptions,
  ): ResultAsync<Review | null, DomainError> {
    const repo = this.getReviewRepository();
    const relations = this.buildRelations(options);

    return ResultAsync.fromPromise(
      repo.findOne({ where: { orderItemId }, relations }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orm) => (orm ? ORMReviewMapper.toDomain(orm) : null));
  }

  @WithPosition()
  findByProductId(
    productId: string,
    pagination: PaginationParams,
    options?: ReviewLoadOptions,
    filter?: ProductReviewFilter,
  ): ResultAsync<PaginatedResult<Review>, DomainError> {
    const repo = this.getReviewRepository();
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const qb = repo
      .createQueryBuilder(REVIEW_ALIAS)
      .where(`${ReviewColumn.PRODUCT_ID} = :${QueryParam.PRODUCT_ID}`, {
        [QueryParam.PRODUCT_ID]: productId,
      })
      .andWhere(`${ReviewColumn.STATUS} = :${QueryParam.ACTIVE_STATUS}`, {
        [QueryParam.ACTIVE_STATUS]: ReviewStatus.ACTIVE,
      });

    // Filter by rating if specified
    if (
      filter?.rating !== undefined &&
      filter.rating >= 1 &&
      filter.rating <= 5
    ) {
      qb.andWhere(`${ReviewColumn.RATING} = :rating`, {
        rating: filter.rating,
      });
    }

    // Filter by hasContent - reviews with non-empty content
    if (filter?.hasContent === true) {
      qb.andWhere(
        `${REVIEW_ALIAS}.content IS NOT NULL AND ${REVIEW_ALIAS}.content != ''`,
      );
    }

    // Always load images for product reviews
    qb.leftJoinAndSelect(
      `${REVIEW_ALIAS}.${ReviewRelation.IMAGES}`,
      REVIEW_IMAGE_ALIAS,
    );

    // Filter by hasImages - reviews that have at least one image
    if (filter?.hasImages === true) {
      qb.andWhere(
        `EXISTS (SELECT 1 FROM product_schema.review_images ri WHERE ri.review_id = ${REVIEW_ALIAS}.id)`,
      );
    }

    if (options?.withReply) {
      qb.leftJoinAndSelect(
        `${REVIEW_ALIAS}.${ReviewRelation.REPLY}`,
        REVIEW_REPLY_ALIAS,
      );
    }

    qb.orderBy(ReviewColumn.CREATED_AT, 'DESC').skip(skip).take(limit);

    return ResultAsync.fromPromise(qb.getManyAndCount(), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map(([orms, total]) => {
      const items = ORMReviewMapper.toDomainList(orms);
      return createPaginatedResult(items, total, page, limit);
    });
  }

  @WithPosition()
  findByShopId(
    shopId: string,
    pagination: PaginationParams,
    options?: ReviewLoadOptions,
  ): ResultAsync<PaginatedResult<Review>, DomainError> {
    const repo = this.getReviewRepository();
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const qb = repo
      .createQueryBuilder(REVIEW_ALIAS)
      .where(`${ReviewColumn.SHOP_ID} = :${QueryParam.SHOP_ID}`, {
        [QueryParam.SHOP_ID]: shopId,
      })
      .andWhere(`${ReviewColumn.STATUS} = :${QueryParam.ACTIVE_STATUS}`, {
        [QueryParam.ACTIVE_STATUS]: ReviewStatus.ACTIVE,
      });

    // Always load images
    qb.leftJoinAndSelect(
      `${REVIEW_ALIAS}.${ReviewRelation.IMAGES}`,
      REVIEW_IMAGE_ALIAS,
    );

    if (options?.withReply) {
      qb.leftJoinAndSelect(
        `${REVIEW_ALIAS}.${ReviewRelation.REPLY}`,
        REVIEW_REPLY_ALIAS,
      );
    }

    qb.orderBy(ReviewColumn.CREATED_AT, 'DESC').skip(skip).take(limit);

    return ResultAsync.fromPromise(qb.getManyAndCount(), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map(([orms, total]) => {
      const items = ORMReviewMapper.toDomainList(orms);
      return createPaginatedResult(items, total, page, limit);
    });
  }

  @WithPosition()
  findByUserId(
    userId: string,
    pagination: PaginationParams,
    options?: ReviewLoadOptions,
  ): ResultAsync<PaginatedResult<Review>, DomainError> {
    const repo = this.getReviewRepository();
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const qb = repo
      .createQueryBuilder(REVIEW_ALIAS)
      .where(`${ReviewColumn.USER_ID} = :${QueryParam.USER_ID}`, {
        [QueryParam.USER_ID]: userId,
      });

    // Always load images
    qb.leftJoinAndSelect(
      `${REVIEW_ALIAS}.${ReviewRelation.IMAGES}`,
      REVIEW_IMAGE_ALIAS,
    );

    if (options?.withReply) {
      qb.leftJoinAndSelect(
        `${REVIEW_ALIAS}.${ReviewRelation.REPLY}`,
        REVIEW_REPLY_ALIAS,
      );
    }

    qb.orderBy(ReviewColumn.CREATED_AT, 'DESC').skip(skip).take(limit);

    return ResultAsync.fromPromise(qb.getManyAndCount(), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map(([orms, total]) => {
      const items = ORMReviewMapper.toDomainList(orms);
      return createPaginatedResult(items, total, page, limit);
    });
  }

  @WithPosition()
  create(review: Review): ResultAsync<Review, DomainError> {
    const em = this.getEntityManager() ?? this.dataSource.manager;

    return ResultAsync.fromPromise(
      em.transaction(async (transactionalEm) => {
        // Save review first
        const reviewRepo = transactionalEm.getRepository(ORMReview);
        const ormReview = ORMReviewMapper.toOrm(review);
        const savedReview = await reviewRepo.save(ormReview);

        // Save images
        if (review.images.length > 0) {
          const imageRepo = transactionalEm.getRepository(ORMReviewImage);
          const ormImages = ORMReviewMapper.imagesToOrm(review.images);
          await imageRepo.save(ormImages);
        }

        // Reload with relations
        const result = await reviewRepo.findOne({
          where: { id: savedReview.id },
          relations: [ReviewRelation.IMAGES],
        });

        return result;
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orm) => ORMReviewMapper.toDomain(orm!));
  }

  @WithPosition()
  update(review: Review): ResultAsync<Review, DomainError> {
    const repo = this.getReviewRepository();
    const orm = ORMReviewMapper.toOrm(review);

    return ResultAsync.fromPromise(repo.save(orm), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    )
      .andThen(() =>
        this.findById(review.id, { withImages: true, withReply: true }),
      )
      .map((found) => found!);
  }

  @WithPosition()
  updateImages(
    reviewId: string,
    images: ReviewImage[],
  ): ResultAsync<void, DomainError> {
    const em = this.getEntityManager() ?? this.dataSource.manager;

    return ResultAsync.fromPromise(
      em.transaction(async (transactionalEm) => {
        const imageRepo = transactionalEm.getRepository(ORMReviewImage);

        // Delete existing images
        await imageRepo.delete({ reviewId });

        // Insert new images
        if (images.length > 0) {
          const ormImages = ORMReviewMapper.imagesToOrm(images);
          await imageRepo.save(ormImages);
        }
      }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map(() => undefined);
  }

  @WithPosition()
  calculateProductRating(
    productId: string,
  ): ResultAsync<RatingResult, DomainError> {
    const repo = this.getReviewRepository();

    return ResultAsync.fromPromise(
      repo
        .createQueryBuilder(REVIEW_ALIAS)
        .select(`AVG(${REVIEW_ALIAS}.rating)`, 'avg')
        .addSelect(`COUNT(*)`, 'count')
        .where(`${ReviewColumn.PRODUCT_ID} = :${QueryParam.PRODUCT_ID}`, {
          [QueryParam.PRODUCT_ID]: productId,
        })
        .andWhere(`${ReviewColumn.STATUS} = :${QueryParam.ACTIVE_STATUS}`, {
          [QueryParam.ACTIVE_STATUS]: ReviewStatus.ACTIVE,
        })
        .getRawOne(),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((result) => ({
      averageRating: result?.avg ? parseFloat(result.avg) : 0,
      totalRatings: result?.count ? parseInt(result.count, 10) : 0,
    }));
  }

  @WithPosition()
  calculateShopRating(shopId: string): ResultAsync<RatingResult, DomainError> {
    const repo = this.getReviewRepository();

    return ResultAsync.fromPromise(
      repo
        .createQueryBuilder(REVIEW_ALIAS)
        .select(`AVG(${REVIEW_ALIAS}.rating)`, 'avg')
        .addSelect(`COUNT(*)`, 'count')
        .where(`${ReviewColumn.SHOP_ID} = :${QueryParam.SHOP_ID}`, {
          [QueryParam.SHOP_ID]: shopId,
        })
        .andWhere(`${ReviewColumn.STATUS} = :${QueryParam.ACTIVE_STATUS}`, {
          [QueryParam.ACTIVE_STATUS]: ReviewStatus.ACTIVE,
        })
        .getRawOne(),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((result) => ({
      averageRating: result?.avg ? parseFloat(result.avg) : 0,
      totalRatings: result?.count ? parseInt(result.count, 10) : 0,
    }));
  }

  // ======================== REPLY OPERATIONS ========================

  @WithPosition()
  findReplyByReviewId(
    reviewId: string,
  ): ResultAsync<ReviewReply | null, DomainError> {
    const repo = this.getReplyRepository();

    return ResultAsync.fromPromise(
      repo.findOne({ where: { reviewId } }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orm) => (orm ? ORMReviewMapper.replyToDomain(orm) : null));
  }

  @WithPosition()
  findReplyById(id: string): ResultAsync<ReviewReply | null, DomainError> {
    const repo = this.getReplyRepository();

    return ResultAsync.fromPromise(repo.findOne({ where: { id } }), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((orm) => (orm ? ORMReviewMapper.replyToDomain(orm) : null));
  }

  @WithPosition()
  createReply(reply: ReviewReply): ResultAsync<ReviewReply, DomainError> {
    const repo = this.getReplyRepository();
    const orm = ORMReviewMapper.replyToOrm(reply);

    return ResultAsync.fromPromise(repo.save(orm), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((saved) => ORMReviewMapper.replyToDomain(saved));
  }

  @WithPosition()
  updateReply(reply: ReviewReply): ResultAsync<ReviewReply, DomainError> {
    const repo = this.getReplyRepository();
    const orm = ORMReviewMapper.replyToOrm(reply);

    return ResultAsync.fromPromise(repo.save(orm), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((saved) => ORMReviewMapper.replyToDomain(saved));
  }

  @WithPosition()
  deleteReply(id: string): ResultAsync<void, DomainError> {
    const repo = this.getReplyRepository();

    return ResultAsync.fromPromise(repo.delete(id), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map(() => undefined);
  }

  // ======================== PRIVATE HELPERS ========================

  private buildRelations(options?: ReviewLoadOptions): string[] {
    const relations: string[] = [];
    if (options?.withImages) relations.push(ReviewRelation.IMAGES);
    if (options?.withReply) relations.push(ReviewRelation.REPLY);
    return relations;
  }

  private getEntityManager() {
    if (!this.als) return null;
    const store = this.als.getStore();
    if (!store || !store.ctx) return null;
    return store.ctx;
  }

  private getReviewRepository() {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return em.getRepository(ORMReview);
  }

  private getReplyRepository() {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return em.getRepository(ORMReviewReply);
  }
}

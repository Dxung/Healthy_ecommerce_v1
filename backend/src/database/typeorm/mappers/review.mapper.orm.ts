import {
  ORMReview,
  ORMReviewImage,
  ORMReviewReply,
} from '../entities/product';
import { Review } from 'src/modules/review/models/review.model';
import { ReviewImage } from 'src/modules/review/models/review-image.model';
import { ReviewReply } from 'src/modules/review/models/review-reply.model';

/**
 * Mapper for converting between ORM entities and domain models for Review and related entities.
 */
export class ORMReviewMapper {
  // ======================== REVIEW ========================

  /**
   * Converts a Review ORM entity to domain model.
   * Maps images and reply if loaded.
   */
  static toDomain(orm: ORMReview): Review {
    const images = orm.images
      ? orm.images.map((img) => this.imageToDomain(img))
      : [];

    const reply = orm.reply ? this.replyToDomain(orm.reply) : null;

    return new Review(
      orm.id,
      orm.orderItemId,
      orm.userId,
      orm.productId,
      orm.shopId,
      orm.rating,
      orm.content,
      orm.status,
      orm.deletedAt,
      orm.createdAt,
      orm.updatedAt,
      images,
      reply,
    );
  }

  /**
   * Converts a Review domain model to ORM entity.
   * Note: Relations (images, reply) are managed separately.
   */
  static toOrm(domain: Review): ORMReview {
    const orm = new ORMReview();
    orm.id = domain.id;
    orm.orderItemId = domain.orderItemId;
    orm.userId = domain.userId;
    orm.productId = domain.productId;
    orm.shopId = domain.shopId;
    orm.rating = domain.rating;
    orm.content = domain.content;
    orm.status = domain.status;
    orm.deletedAt = domain.deletedAt;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    return orm;
  }

  /**
   * Converts array of ORM entities to domain models
   */
  static toDomainList(ormEntities: ORMReview[]): Review[] {
    return ormEntities.map((orm) => this.toDomain(orm));
  }

  // ======================== REVIEW IMAGE ========================

  /**
   * Converts a ReviewImage ORM entity to domain model
   */
  static imageToDomain(orm: ORMReviewImage): ReviewImage {
    return new ReviewImage(
      orm.id,
      orm.reviewId,
      orm.imageUrl,
      orm.displayOrder,
      orm.createdAt,
    );
  }

  /**
   * Converts a ReviewImage domain model to ORM entity
   */
  static imageToOrm(domain: ReviewImage): ORMReviewImage {
    const orm = new ORMReviewImage();
    orm.id = domain.id;
    orm.reviewId = domain.reviewId;
    orm.imageUrl = domain.imageUrl;
    orm.displayOrder = domain.displayOrder;
    orm.createdAt = domain.createdAt;
    return orm;
  }

  /**
   * Converts array of ReviewImage domain models to ORM entities
   */
  static imagesToOrm(domains: ReviewImage[]): ORMReviewImage[] {
    return domains.map((d) => this.imageToOrm(d));
  }

  // ======================== REVIEW REPLY ========================

  /**
   * Converts a ReviewReply ORM entity to domain model
   */
  static replyToDomain(orm: ORMReviewReply): ReviewReply {
    return new ReviewReply(
      orm.id,
      orm.reviewId,
      orm.shopId,
      orm.content,
      orm.createdAt,
      orm.updatedAt,
    );
  }

  /**
   * Converts a ReviewReply domain model to ORM entity
   */
  static replyToOrm(domain: ReviewReply): ORMReviewReply {
    const orm = new ORMReviewReply();
    orm.id = domain.id;
    orm.reviewId = domain.reviewId;
    orm.shopId = domain.shopId;
    orm.content = domain.content;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    return orm;
  }
}

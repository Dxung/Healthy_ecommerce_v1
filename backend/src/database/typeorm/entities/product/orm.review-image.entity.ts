import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ORMReview } from './orm.review.entity';

/**
 * ORM Entity for review_images table.
 * Stores images attached to product reviews.
 */
@Entity('review_images', { schema: 'product_schema' })
@Index('idx_review_images_review_id', ['reviewId'])
export class ORMReviewImage {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  /** Review this image belongs to */
  @Column({ name: 'review_id', type: 'uuid' })
  reviewId: string;

  /** URL of the uploaded image */
  @Column({ name: 'image_url', type: 'varchar', length: 500 })
  imageUrl: string;

  /** Display order for sorting images */
  @Column({ name: 'display_order', type: 'integer', default: 0 })
  displayOrder: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  // ======================== RELATIONSHIPS ========================

  /** Review this image belongs to */
  @ManyToOne(() => ORMReview, (review) => review.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'review_id' })
  review: ORMReview;
}

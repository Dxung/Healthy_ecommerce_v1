import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { ORMReview } from './orm.review.entity';
import { ORMShop } from '../shop';

/**
 * ORM Entity for review_replies table.
 * Stores shop responses to product reviews.
 * Each review can have at most one reply from the shop.
 */
@Entity('review_replies', { schema: 'product_schema' })
@Index('idx_review_replies_review_id', ['reviewId'])
@Index('idx_review_replies_shop_id', ['shopId'])
@Unique('uq_review_replies_review_id', ['reviewId'])
export class ORMReviewReply {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  /** Review being replied to */
  @Column({ name: 'review_id', type: 'uuid' })
  reviewId: string;

  /** Shop that wrote the reply */
  @Column({ name: 'shop_id', type: 'uuid' })
  shopId: string;

  /** Reply text content */
  @Column({ name: 'content', type: 'text' })
  content: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  // ======================== RELATIONSHIPS ========================

  /** Review being replied to */
  @OneToOne(() => ORMReview, (review) => review.reply, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'review_id' })
  review: ORMReview;

  /** Shop that wrote the reply */
  @ManyToOne(() => ORMShop, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shop_id' })
  shop: ORMShop;
}

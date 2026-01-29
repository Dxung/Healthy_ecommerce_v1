import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { ORMUserCore } from '../user';
import { ORMShop } from '../shop';
import { ORMProduct } from './orm.product.entity';
import { ORMOrderItem } from '../order';
import { ORMReviewImage } from './orm.review-image.entity';
import { ORMReviewReply } from './orm.review-reply.entity';
import { ReviewStatus } from './enums/review-status.enum';

/**
 * ORM Entity for reviews table.
 * Represents a product review submitted by a buyer after order completion.
 * Each review is linked to a specific order item (one review per order item).
 */
@Entity('reviews', { schema: 'product_schema' })
@Index('idx_reviews_product_id', ['productId'])
@Index('idx_reviews_shop_id', ['shopId'])
@Index('idx_reviews_user_id', ['userId'])
@Index('idx_reviews_status', ['status'])
@Unique('uq_reviews_order_item', ['orderItemId'])
export class ORMReview {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  /** Reference to the specific order item being reviewed */
  @Column({ name: 'order_item_id', type: 'uuid' })
  orderItemId: string;

  /** User who wrote the review */
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  /** Product being reviewed */
  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  /** Shop that sold the product */
  @Column({ name: 'shop_id', type: 'uuid' })
  shopId: string;

  /** Rating from 1 to 5 stars */
  @Column({ name: 'rating', type: 'smallint' })
  rating: number;

  /** Review text content (optional) */
  @Column({ name: 'content', type: 'text', nullable: true })
  content: string | null;

  /** Review status (active, hidden_due_to_refund, deleted) */
  @Column({
    name: 'status',
    type: 'enum',
    enum: ReviewStatus,
    enumName: 'review_status_enum',
    default: ReviewStatus.ACTIVE,
  })
  status: ReviewStatus;

  /** Soft delete timestamp (set when status is 'deleted') */
  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  // ======================== RELATIONSHIPS ========================

  /** Order item this review is for */
  @ManyToOne(() => ORMOrderItem)
  @JoinColumn({ name: 'order_item_id' })
  orderItem: ORMOrderItem;

  /** User who wrote the review */
  @ManyToOne(() => ORMUserCore)
  @JoinColumn({ name: 'user_id' })
  user: ORMUserCore;

  /** Product being reviewed */
  @ManyToOne(() => ORMProduct, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: ORMProduct;

  /** Shop that sold the product */
  @ManyToOne(() => ORMShop, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shop_id' })
  shop: ORMShop;

  /** Images attached to the review */
  @OneToMany(() => ORMReviewImage, (image) => image.review)
  images: ORMReviewImage[];

  /** Shop's reply to this review (one per review) */
  @OneToOne(() => ORMReviewReply, (reply) => reply.review)
  reply: ORMReviewReply | null;
}

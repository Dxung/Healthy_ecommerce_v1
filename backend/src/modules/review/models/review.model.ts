import { v7 as uuidv7 } from 'uuid';
import { ReviewStatus } from 'src/database/typeorm/entities/product/enums/review-status.enum';
import { ReviewImage } from './review-image.model';
import { ReviewReply } from './review-reply.model';

/**
 * Review Domain Model
 * Represents a product review submitted by a buyer after order completion.
 */
export class Review {
  private _rating: number;
  private _content: string | null;
  private _status: ReviewStatus;
  private _deletedAt: Date | null;
  private _updatedAt: Date;
  private _images: ReviewImage[];
  private _reply: ReviewReply | null;

  constructor(
    private readonly _id: string,
    private readonly _orderItemId: string,
    private readonly _userId: string,
    private readonly _productId: string,
    private readonly _shopId: string,
    rating: number,
    content: string | null,
    status: ReviewStatus,
    deletedAt: Date | null,
    private readonly _createdAt: Date,
    updatedAt: Date,
    images: ReviewImage[] = [],
    reply: ReviewReply | null = null,
  ) {
    this._rating = rating;
    this._content = content;
    this._status = status;
    this._deletedAt = deletedAt;
    this._updatedAt = updatedAt;
    this._images = images;
    this._reply = reply;
  }

  /**
   * Creates a new review
   */
  static create(params: {
    orderItemId: string;
    userId: string;
    productId: string;
    shopId: string;
    rating: number;
    content: string | null;
    imageUrls: string[];
  }): Review {
    const now = new Date();
    const reviewId = uuidv7();

    const images = params.imageUrls.map((url, index) =>
      ReviewImage.create({
        reviewId,
        imageUrl: url,
        displayOrder: index,
      }),
    );

    return new Review(
      reviewId,
      params.orderItemId,
      params.userId,
      params.productId,
      params.shopId,
      params.rating,
      params.content,
      ReviewStatus.ACTIVE,
      null,
      now,
      now,
      images,
      null,
    );
  }

  // ======================== GETTERS ========================

  get id(): string {
    return this._id;
  }

  get orderItemId(): string {
    return this._orderItemId;
  }

  get userId(): string {
    return this._userId;
  }

  get productId(): string {
    return this._productId;
  }

  get shopId(): string {
    return this._shopId;
  }

  get rating(): number {
    return this._rating;
  }

  get content(): string | null {
    return this._content;
  }

  get status(): ReviewStatus {
    return this._status;
  }

  get deletedAt(): Date | null {
    return this._deletedAt;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get images(): ReviewImage[] {
    return [...this._images];
  }

  get reply(): ReviewReply | null {
    return this._reply;
  }

  // ======================== BUSINESS LOGIC ========================

  /**
   * Check if this review is active and visible
   */
  isActive(): boolean {
    return this._status === ReviewStatus.ACTIVE;
  }

  /**
   * Check if this review has been hidden due to refund
   */
  isHiddenDueToRefund(): boolean {
    return this._status === ReviewStatus.HIDDEN_DUE_TO_REFUND;
  }

  /**
   * Check if this review has been soft deleted
   */
  isDeleted(): boolean {
    return this._status === ReviewStatus.DELETED;
  }

  /**
   * Check if this review is owned by the given user
   */
  isOwnedBy(userId: string): boolean {
    return this._userId === userId;
  }

  /**
   * Check if this review can be edited/deleted
   */
  canBeModified(): boolean {
    return this._status === ReviewStatus.ACTIVE;
  }

  /**
   * Update the review rating and content
   */
  update(rating?: number, content?: string | null): void {
    if (rating !== undefined) {
      this._rating = rating;
    }
    if (content !== undefined) {
      this._content = content;
    }
    this._updatedAt = new Date();
  }

  /**
   * Update review images
   */
  updateImages(newImages: ReviewImage[]): void {
    this._images = newImages;
    this._updatedAt = new Date();
  }

  /**
   * Soft delete the review
   */
  softDelete(): void {
    this._status = ReviewStatus.DELETED;
    this._deletedAt = new Date();
    this._updatedAt = new Date();
  }

  /**
   * Hide the review due to item refund
   */
  hideForRefund(): void {
    this._status = ReviewStatus.HIDDEN_DUE_TO_REFUND;
    this._updatedAt = new Date();
  }

  /**
   * Set the reply for this review
   */
  setReply(reply: ReviewReply | null): void {
    this._reply = reply;
  }
}

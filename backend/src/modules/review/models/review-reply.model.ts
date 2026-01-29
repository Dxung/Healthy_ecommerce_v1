import { v7 as uuidv7 } from 'uuid';

/**
 * ReviewReply Domain Model
 * Represents a shop's response to a product review.
 */
export class ReviewReply {
  private _content: string;
  private _updatedAt: Date;

  constructor(
    private readonly _id: string,
    private readonly _reviewId: string,
    private readonly _shopId: string,
    content: string,
    private readonly _createdAt: Date,
    updatedAt: Date,
  ) {
    this._content = content;
    this._updatedAt = updatedAt;
  }

  /**
   * Creates a new review reply
   */
  static create(params: {
    reviewId: string;
    shopId: string;
    content: string;
  }): ReviewReply {
    const now = new Date();
    return new ReviewReply(
      uuidv7(),
      params.reviewId,
      params.shopId,
      params.content,
      now,
      now,
    );
  }

  // ======================== GETTERS ========================

  get id(): string {
    return this._id;
  }

  get reviewId(): string {
    return this._reviewId;
  }

  get shopId(): string {
    return this._shopId;
  }

  get content(): string {
    return this._content;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // ======================== BUSINESS LOGIC ========================

  /**
   * Updates the reply content
   */
  updateContent(newContent: string): void {
    this._content = newContent;
    this._updatedAt = new Date();
  }
}

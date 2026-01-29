import { v7 as uuidv7 } from 'uuid';

/**
 * ReviewImage Domain Model
 * Represents an image attached to a product review.
 */
export class ReviewImage {
  constructor(
    private readonly _id: string,
    private readonly _reviewId: string,
    private readonly _imageUrl: string,
    private readonly _displayOrder: number,
    private readonly _createdAt: Date,
  ) {}

  /**
   * Creates a new review image
   */
  static create(params: {
    reviewId: string;
    imageUrl: string;
    displayOrder: number;
  }): ReviewImage {
    return new ReviewImage(
      uuidv7(),
      params.reviewId,
      params.imageUrl,
      params.displayOrder,
      new Date(),
    );
  }

  // ======================== GETTERS ========================

  get id(): string {
    return this._id;
  }

  get reviewId(): string {
    return this._reviewId;
  }

  get imageUrl(): string {
    return this._imageUrl;
  }

  get displayOrder(): number {
    return this._displayOrder;
  }

  get createdAt(): Date {
    return this._createdAt;
  }
}

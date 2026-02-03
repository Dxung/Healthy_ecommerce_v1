import { v7 as uuidv7 } from 'uuid';
import { Result, ok, err } from 'neverthrow';
import { BadgeApplicationType } from 'src/database/typeorm/entities/shop/enums/badge-application-type.enum';
import { BadgeApplicationStatus } from 'src/database/typeorm/entities/shop/enums/badge-application-status.enum';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { BADGE_APPLICATION_ERRORS } from '../errors/badge-application.errors';

/**
 * Document submitted with a badge application.
 */
export interface BadgeApplicationDocument {
  id: string;
  applicationId: string;
  documentTypeId: string;
  documentTypeName?: string;
  imageUrl: string;
  expiresAt: Date | null;
  createdAt: Date;
}

/**
 * Data for creating a badge application document.
 */
export interface CreateBadgeApplicationDocumentData {
  documentTypeId: string;
  imageUrl: string;
  expiresAt: Date | null;
}

/**
 * Domain model for badge application.
 *
 * Represents an application for Verified or Official badge submitted by a shop.
 */
export class BadgeApplication {
  private _documents: BadgeApplicationDocument[] = [];
  private _shopName?: string;
  private _brandName?: string | null;

  constructor(
    private readonly _id: string,
    private readonly _shopId: string,
    private readonly _applicationType: BadgeApplicationType,
    private readonly _brandId: string | null,
    private _status: BadgeApplicationStatus,
    private _rejectionReason: string | null,
    private _reviewedBy: string | null,
    private _reviewedAt: Date | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    documents: BadgeApplicationDocument[] = [],
  ) {
    this._documents = documents;
  }

  // ======================== FACTORY METHODS ========================

  /**
   * Creates a new Verified badge application.
   */
  static createVerified(
    shopId: string,
    documents: CreateBadgeApplicationDocumentData[],
  ): BadgeApplication {
    const id = uuidv7();
    const now = new Date();

    const application = new BadgeApplication(
      id,
      shopId,
      BadgeApplicationType.VERIFIED,
      null, // brandId - not applicable for verified
      BadgeApplicationStatus.PENDING,
      null, // rejectionReason
      null, // reviewedBy
      null, // reviewedAt
      now,
      now,
    );

    // Create documents
    application._documents = documents.map((doc) => ({
      id: uuidv7(),
      applicationId: id,
      documentTypeId: doc.documentTypeId,
      imageUrl: doc.imageUrl,
      expiresAt: doc.expiresAt,
      createdAt: now,
    }));

    return application;
  }

  /**
   * Creates a new Official badge application for a specific brand.
   */
  static createOfficial(
    shopId: string,
    brandId: string,
    documents: CreateBadgeApplicationDocumentData[],
  ): BadgeApplication {
    const id = uuidv7();
    const now = new Date();

    const application = new BadgeApplication(
      id,
      shopId,
      BadgeApplicationType.OFFICIAL,
      brandId,
      BadgeApplicationStatus.PENDING,
      null, // rejectionReason
      null, // reviewedBy
      null, // reviewedAt
      now,
      now,
    );

    // Create documents
    application._documents = documents.map((doc) => ({
      id: uuidv7(),
      applicationId: id,
      documentTypeId: doc.documentTypeId,
      imageUrl: doc.imageUrl,
      expiresAt: doc.expiresAt,
      createdAt: now,
    }));

    return application;
  }

  // ======================== BUSINESS RULES ========================

  /**
   * Checks if application is pending.
   */
  public isPending(): boolean {
    return this._status === BadgeApplicationStatus.PENDING;
  }

  /**
   * Checks if application is for verified badge.
   */
  public isVerified(): boolean {
    return this._applicationType === BadgeApplicationType.VERIFIED;
  }

  /**
   * Checks if application is for official badge.
   */
  public isOfficial(): boolean {
    return this._applicationType === BadgeApplicationType.OFFICIAL;
  }

  /**
   * Gets the earliest expiration date from all documents.
   * Used to set badge/official-brand expiration.
   *
   * Returns null if ALL documents have no expiry (permanent badge).
   * Ignores documents with null expiresAt when calculating.
   */
  public getEarliestDocumentExpiry(): Date | null {
    if (this._documents.length === 0) {
      throw new Error('Application has no documents');
    }

    // Filter documents that have an expiry date
    const docsWithExpiry = this._documents.filter(
      (doc) => doc.expiresAt !== null,
    );

    // If no documents have an expiry, the badge is permanent
    if (docsWithExpiry.length === 0) {
      return null;
    }

    // Find the earliest expiry among documents that have one
    return docsWithExpiry.reduce((earliest, doc) => {
      return doc.expiresAt! < earliest ? doc.expiresAt! : earliest;
    }, docsWithExpiry[0].expiresAt!);
  }

  // ======================== CHANGE METHODS ========================

  /**
   * Approves this application.
   */
  public approve(reviewerId: string): Result<void, DomainError> {
    if (!this.isPending()) {
      return err(
        createDomainError(BADGE_APPLICATION_ERRORS.CANNOT_APPROVE_NON_PENDING, {
          cause: `Application status is ${this._status}`,
        }),
      );
    }

    this._status = BadgeApplicationStatus.APPROVED;
    this._reviewedBy = reviewerId;
    this._reviewedAt = new Date();
    this._updatedAt = new Date();
    return ok(undefined);
  }

  /**
   * Rejects this application.
   */
  public reject(reviewerId: string, reason: string): Result<void, DomainError> {
    if (!this.isPending()) {
      return err(
        createDomainError(BADGE_APPLICATION_ERRORS.CANNOT_REJECT_NON_PENDING, {
          cause: `Application status is ${this._status}`,
        }),
      );
    }

    this._status = BadgeApplicationStatus.REJECTED;
    this._rejectionReason = reason;
    this._reviewedBy = reviewerId;
    this._reviewedAt = new Date();
    this._updatedAt = new Date();
    return ok(undefined);
  }

  /**
   * Cancels this application (by shop owner).
   */
  public cancel(): Result<void, DomainError> {
    if (!this.isPending()) {
      return err(
        createDomainError(BADGE_APPLICATION_ERRORS.CANNOT_CANCEL_NON_PENDING, {
          cause: `Application status is ${this._status}`,
        }),
      );
    }

    this._status = BadgeApplicationStatus.CANCELLED;
    this._updatedAt = new Date();
    return ok(undefined);
  }

  /**
   * Sets documents from database.
   */
  public setDocuments(documents: BadgeApplicationDocument[]): void {
    this._documents = documents;
  }

  /**
   * Sets shop name (for admin view).
   */
  public setShopName(shopName: string): void {
    this._shopName = shopName;
  }

  /**
   * Sets brand name (for admin view).
   */
  public setBrandName(brandName: string | null): void {
    this._brandName = brandName;
  }

  // ======================== GETTERS ========================

  public get id(): string {
    return this._id;
  }

  public get shopId(): string {
    return this._shopId;
  }

  public get shopName(): string | undefined {
    return this._shopName;
  }

  public get applicationType(): BadgeApplicationType {
    return this._applicationType;
  }

  public get brandId(): string | null {
    return this._brandId;
  }

  public get brandName(): string | null | undefined {
    return this._brandName;
  }

  public get status(): BadgeApplicationStatus {
    return this._status;
  }

  public get rejectionReason(): string | null {
    return this._rejectionReason;
  }

  public get reviewedBy(): string | null {
    return this._reviewedBy;
  }

  public get reviewedAt(): Date | null {
    return this._reviewedAt;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public get documents(): BadgeApplicationDocument[] {
    return this._documents;
  }
}

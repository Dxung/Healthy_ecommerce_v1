import { v7 as uuidv7 } from 'uuid';
import { ShopRegistrationStatus } from 'src/database/typeorm/entities/shop/enums/shop-registration-status.enum';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { err, ok, Result } from 'neverthrow';
import { SHOP_ERRORS } from '../errors/shop.errors';

/**
 * Document uploaded during shop registration for "approved" badge
 */
export interface ShopRegistrationDocument {
  id: string;
  registrationId: string;
  documentTypeId: string;
  imageUrl: string;
  expiresAt: Date | null;
  createdAt: Date;
}

/**
 * Brand document uploaded during shop registration for "official" badge
 */
export interface ShopRegistrationBrandDocument {
  id: string;
  registrationId: string;
  documentTypeId: string;
  imageUrl: string;
  expiresAt: Date | null;
  createdAt: Date;
}

/**
 * Data required to create a new shop registration request
 */
export interface CreateShopRegistrationData {
  name: string;
  phone: string;
  email: string;
  addressLine: string;
  wardId: string;
  districtId: string;
  provinceId: string;
  logoUrl?: string;
  coverUrl?: string;
  requestedBrandId?: string;
  documents?: Array<{
    documentTypeId: string;
    imageUrl: string;
    expiresAt?: Date;
  }>;
  brandDocuments?: Array<{
    documentTypeId: string;
    imageUrl: string;
    expiresAt?: Date;
  }>;
}

/**
 * ShopRegistrationRequest Business Model
 *
 * This model represents a shop registration request submitted by a user.
 * Users submit registration requests which admin can approve or reject.
 *
 * Fields:
 *
 * 1. Immutable Fields (set only at creation):
 * - id: Unique identifier
 * - userId: Reference to the user who submitted the request
 * - name: Shop name
 * - slug: Auto-generated from shop name (unique)
 * - phone: Contact phone number
 * - email: Contact email
 * - addressLine: Street address
 * - wardId, districtId, provinceId: Location references
 * - requestedBrandId: Optional brand ID if applying for official badge
 * - createdAt: Timestamp of request creation
 *
 * 2. Optional Fields:
 * - logoUrl: Shop logo URL
 * - coverUrl: Shop cover image URL
 *
 * 3. Admin-controlled Fields:
 * - status: pending -> approved | rejected
 * - rejectionReason: Set when rejected
 * - reviewedBy: Admin who reviewed
 * - reviewedAt: When reviewed
 */
export class ShopRegistrationRequest {
  private _documents: ShopRegistrationDocument[];
  private _brandDocuments: ShopRegistrationBrandDocument[];

  constructor(
    private readonly _id: string,
    private readonly _userId: string,
    private readonly _name: string,
    private readonly _slug: string,
    private readonly _phone: string,
    private readonly _email: string,
    private readonly _addressLine: string,
    private readonly _wardId: string,
    private readonly _districtId: string,
    private readonly _provinceId: string,
    private _logoUrl: string | null,
    private _coverUrl: string | null,
    private readonly _requestedBrandId: string | null,
    private _status: ShopRegistrationStatus,
    private _rejectionReason: string | null,
    private _reviewedBy: string | null,
    private _reviewedAt: Date | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    documents: ShopRegistrationDocument[] = [],
    brandDocuments: ShopRegistrationBrandDocument[] = [],
  ) {
    this._documents = documents;
    this._brandDocuments = brandDocuments;
  }

  /**
   * Factory method to create a new ShopRegistrationRequest
   * @param userId - The ID of the user submitting the registration
   * @param data - Registration data including shop details and optional documents
   * @returns A new ShopRegistrationRequest instance
   */
  static createNew(
    userId: string,
    data: CreateShopRegistrationData,
  ): ShopRegistrationRequest {
    const id = uuidv7();
    const now = new Date();
    const slug = this.generateSlug(data.name);

    // Create document instances
    const documents: ShopRegistrationDocument[] =
      data.documents?.map((doc) => ({
        id: uuidv7(),
        registrationId: id,
        documentTypeId: doc.documentTypeId,
        imageUrl: doc.imageUrl,
        expiresAt: doc.expiresAt ?? null,
        createdAt: now,
      })) ?? [];

    const brandDocuments: ShopRegistrationBrandDocument[] =
      data.brandDocuments?.map((doc) => ({
        id: uuidv7(),
        registrationId: id,
        documentTypeId: doc.documentTypeId,
        imageUrl: doc.imageUrl,
        expiresAt: doc.expiresAt ?? null,
        createdAt: now,
      })) ?? [];

    return new ShopRegistrationRequest(
      id,
      userId,
      data.name,
      slug,
      data.phone,
      data.email,
      data.addressLine,
      data.wardId,
      data.districtId,
      data.provinceId,
      data.logoUrl ?? null,
      data.coverUrl ?? null,
      data.requestedBrandId ?? null,
      ShopRegistrationStatus.PENDING,
      null,
      null,
      null,
      now,
      now,
      documents,
      brandDocuments,
    );
  }

  /**
   * Factory method to create a new ShopRegistrationRequest with pre-generated slug
   * Used in 2-phase registration where slug is validated in Phase 1
   * @param userId - The ID of the user submitting the registration
   * @param slug - The pre-generated slug from Phase 1
   * @param data - Registration data including shop details and optional documents
   * @returns A new ShopRegistrationRequest instance
   */
  static createNewWithSlug(
    userId: string,
    slug: string,
    data: CreateShopRegistrationData,
  ): ShopRegistrationRequest {
    const id = uuidv7();
    const now = new Date();

    // Create document instances
    const documents: ShopRegistrationDocument[] =
      data.documents?.map((doc) => ({
        id: uuidv7(),
        registrationId: id,
        documentTypeId: doc.documentTypeId,
        imageUrl: doc.imageUrl,
        expiresAt: doc.expiresAt ?? null,
        createdAt: now,
      })) ?? [];

    const brandDocuments: ShopRegistrationBrandDocument[] =
      data.brandDocuments?.map((doc) => ({
        id: uuidv7(),
        registrationId: id,
        documentTypeId: doc.documentTypeId,
        imageUrl: doc.imageUrl,
        expiresAt: doc.expiresAt ?? null,
        createdAt: now,
      })) ?? [];

    return new ShopRegistrationRequest(
      id,
      userId,
      data.name,
      slug,
      data.phone,
      data.email,
      data.addressLine,
      data.wardId,
      data.districtId,
      data.provinceId,
      data.logoUrl ?? null,
      data.coverUrl ?? null,
      data.requestedBrandId ?? null,
      ShopRegistrationStatus.PENDING,
      null,
      null,
      null,
      now,
      now,
      documents,
      brandDocuments,
    );
  }

  /**
   * Generates a URL-friendly slug from shop name
   * - Converts to lowercase
   * - Removes Vietnamese diacritics
   * - Replaces non-alphanumeric characters with dashes
   * - Trims leading/trailing dashes
   */
  public static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/đ/g, 'd') // Handle Vietnamese đ
      .replace(/Đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with dash
      .replace(/^-+|-+$/g, ''); // Trim dashes
  }

  //--------------------BUSINESS RULES ----------------------

  /**
   * Checks if the registration can be approved
   */
  public canBeApproved(): boolean {
    return this._status === ShopRegistrationStatus.PENDING;
  }

  /**
   * Checks if the registration can be rejected
   */
  public canBeRejected(): boolean {
    return this._status === ShopRegistrationStatus.PENDING;
  }

  /**
   * Checks if the registration is pending
   */
  public isPending(): boolean {
    return this._status === ShopRegistrationStatus.PENDING;
  }

  /**
   * Checks if the registration has documents for approved badge
   */
  public hasDocumentsForApprovedBadge(): boolean {
    return this._documents.length > 0;
  }

  /**
   * Checks if the registration is applying for official badge
   */
  public isApplyingForOfficialBadge(): boolean {
    return this._requestedBrandId !== null && this._brandDocuments.length > 0;
  }

  //--------------------CHANGE METHODS ----------------------

  /**
   * Approves the registration request
   * @param reviewerId - ID of the admin approving the request
   * @returns Result indicating success or failure
   */
  public approve(reviewerId: string): Result<void, DomainError> {
    if (!this.canBeApproved()) {
      return err(
        createDomainError(SHOP_ERRORS.REGISTRATION_ALREADY_PROCESSED, {
          cause: `Registration status is ${this._status}, not pending`,
        }),
      );
    }

    this._status = ShopRegistrationStatus.APPROVED;
    this._reviewedBy = reviewerId;
    this._reviewedAt = new Date();
    this._updatedAt = new Date();
    return ok(undefined);
  }

  /**
   * Rejects the registration request
   * @param reviewerId - ID of the admin rejecting the request
   * @param reason - Reason for rejection
   * @returns Result indicating success or failure
   */
  public reject(reviewerId: string, reason: string): Result<void, DomainError> {
    if (!this.canBeRejected()) {
      return err(
        createDomainError(SHOP_ERRORS.REGISTRATION_ALREADY_PROCESSED, {
          cause: `Registration status is ${this._status}, not pending`,
        }),
      );
    }

    this._status = ShopRegistrationStatus.REJECTED;
    this._rejectionReason = reason;
    this._reviewedBy = reviewerId;
    this._reviewedAt = new Date();
    this._updatedAt = new Date();
    return ok(undefined);
  }

  //--------------------GETTER METHODS ----------------------

  public get id(): string {
    return this._id;
  }

  public get userId(): string {
    return this._userId;
  }

  public get name(): string {
    return this._name;
  }

  public get slug(): string {
    return this._slug;
  }

  public get phone(): string {
    return this._phone;
  }

  public get email(): string {
    return this._email;
  }

  public get addressLine(): string {
    return this._addressLine;
  }

  public get wardId(): string {
    return this._wardId;
  }

  public get districtId(): string {
    return this._districtId;
  }

  public get provinceId(): string {
    return this._provinceId;
  }

  public get logoUrl(): string | null {
    return this._logoUrl;
  }

  public get coverUrl(): string | null {
    return this._coverUrl;
  }

  public get requestedBrandId(): string | null {
    return this._requestedBrandId;
  }

  public get status(): ShopRegistrationStatus {
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

  public get documents(): readonly ShopRegistrationDocument[] {
    return this._documents;
  }

  public get brandDocuments(): readonly ShopRegistrationBrandDocument[] {
    return this._brandDocuments;
  }
}

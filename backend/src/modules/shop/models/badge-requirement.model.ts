import { v7 as uuidv7 } from 'uuid';
import { ShopBadgeCode } from 'src/database/typeorm/entities/shop/enums/shop-badge-code.enum';
import { RequirementType } from 'src/database/typeorm/entities/shop/enums/requirement-type.enum';
import { ShopAttributeCode } from 'src/database/typeorm/entities/shop/enums/shop-attribute-code.enum';
import { ComparisonOperator } from 'src/database/typeorm/entities/shop/enums/comparison-operator.enum';
import type { DocumentType } from './document-type.model';

/**
 * Domain model for BadgeRequirement.
 * Links badges to their requirements (either documents or shop attributes).
 */
export class BadgeRequirement {
  private _documentType: DocumentType | null = null;

  constructor(
    private readonly _id: string,
    private readonly _badgeCode: ShopBadgeCode,
    private readonly _requirementType: RequirementType,
    private readonly _documentTypeId: string | null,
    private readonly _attributeCode: ShopAttributeCode | null,
    private readonly _operator: ComparisonOperator | null,
    private readonly _attributeValue: number | null,
    private _isActive: boolean,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    documentType: DocumentType | null = null,
  ) {
    this._documentType = documentType;
  }

  // ======================== FACTORY METHODS ========================

  /**
   * Creates a new document-based requirement.
   */
  static createDocumentRequirement(data: {
    badgeCode: ShopBadgeCode;
    documentTypeId: string;
  }): BadgeRequirement {
    const now = new Date();
    return new BadgeRequirement(
      uuidv7(),
      data.badgeCode,
      RequirementType.DOCUMENT,
      data.documentTypeId,
      null, // attributeCode
      null, // operator
      null, // attributeValue
      true, // isActive
      now,
      now,
    );
  }

  /**
   * Creates a new attribute-based requirement.
   */
  static createAttributeRequirement(data: {
    badgeCode: ShopBadgeCode;
    attributeCode: ShopAttributeCode;
    operator: ComparisonOperator;
    attributeValue: number;
  }): BadgeRequirement {
    const now = new Date();
    return new BadgeRequirement(
      uuidv7(),
      data.badgeCode,
      RequirementType.ATTRIBUTE,
      null, // documentTypeId
      data.attributeCode,
      data.operator,
      data.attributeValue,
      true, // isActive
      now,
      now,
    );
  }

  // ======================== BUSINESS METHODS ========================

  /**
   * Checks if this is a document requirement.
   */
  public isDocumentRequirement(): boolean {
    return this._requirementType === RequirementType.DOCUMENT;
  }

  /**
   * Checks if this is an attribute requirement.
   */
  public isAttributeRequirement(): boolean {
    return this._requirementType === RequirementType.ATTRIBUTE;
  }

  /**
   * Sets the document type (from relation).
   */
  public setDocumentType(documentType: DocumentType | null): void {
    this._documentType = documentType;
  }

  /**
   * Toggles the active status.
   */
  public toggleActive(): void {
    this._isActive = !this._isActive;
    this._updatedAt = new Date();
  }

  /**
   * Sets the active status.
   */
  public setActive(active: boolean): void {
    this._isActive = active;
    this._updatedAt = new Date();
  }

  /**
   * Gets a human-readable description of the requirement.
   */
  public getDescription(): string {
    if (this._requirementType === RequirementType.DOCUMENT) {
      return `Document: ${this._documentType?.name ?? this._documentTypeId}`;
    }

    const operatorLabels: Record<ComparisonOperator, string> = {
      [ComparisonOperator.GT]: '>',
      [ComparisonOperator.GTE]: '>=',
      [ComparisonOperator.LT]: '<',
      [ComparisonOperator.LTE]: '<=',
      [ComparisonOperator.EQ]: '=',
    };

    return `${this._attributeCode} ${operatorLabels[this._operator!]} ${this._attributeValue}`;
  }

  // ======================== GETTERS ========================

  public get id(): string {
    return this._id;
  }

  public get badgeCode(): ShopBadgeCode {
    return this._badgeCode;
  }

  public get requirementType(): RequirementType {
    return this._requirementType;
  }

  public get documentTypeId(): string | null {
    return this._documentTypeId;
  }

  public get attributeCode(): ShopAttributeCode | null {
    return this._attributeCode;
  }

  public get operator(): ComparisonOperator | null {
    return this._operator;
  }

  public get attributeValue(): number | null {
    return this._attributeValue;
  }

  public get isActive(): boolean {
    return this._isActive;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public get documentType(): DocumentType | null {
    return this._documentType;
  }
}

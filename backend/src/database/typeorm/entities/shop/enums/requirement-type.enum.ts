/**
 * Requirement type enum for badge requirements.
 * Maps to shop_schema.requirement_type_enum in PostgreSQL.
 */
export enum RequirementType {
  /** Document-based requirement (e.g., business license) */
  DOCUMENT = 'document',

  /** Attribute-based requirement (e.g., rating >= 4.5) */
  ATTRIBUTE = 'attribute',
}

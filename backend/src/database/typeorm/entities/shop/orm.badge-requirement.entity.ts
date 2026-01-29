import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ShopBadgeCode } from './enums/shop-badge-code.enum';
import { RequirementType } from './enums/requirement-type.enum';
import { ShopAttributeCode } from './enums/shop-attribute-code.enum';
import { ComparisonOperator } from './enums/comparison-operator.enum';
import { ORMShopBadge } from './orm.shop-badge.entity';
import { ORMDocumentType } from './orm.document-type.entity';

/**
 * ORM Entity for badge_requirements table.
 * Links badges to their requirements (either documents or shop attributes).
 */
@Entity('badge_requirements', { schema: 'shop_schema' })
@Index('idx_badge_req_badge', ['badgeCode'])
@Index('idx_badge_req_type', ['requirementType'])
export class ORMBadgeRequirement {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({
    name: 'badge_code',
    type: 'enum',
    enum: ShopBadgeCode,
    enumName: 'badge_code_enum',
  })
  badgeCode: ShopBadgeCode;

  @Column({
    name: 'requirement_type',
    type: 'enum',
    enum: RequirementType,
    enumName: 'requirement_type_enum',
  })
  requirementType: RequirementType;

  // Document requirement fields
  @Column({ name: 'document_type_id', type: 'uuid', nullable: true })
  documentTypeId: string | null;

  // Attribute requirement fields
  @Column({
    name: 'attribute_code',
    type: 'enum',
    enum: ShopAttributeCode,
    enumName: 'shop_attribute_code_enum',
    nullable: true,
  })
  attributeCode: ShopAttributeCode | null;

  @Column({
    name: 'operator',
    type: 'enum',
    enum: ComparisonOperator,
    enumName: 'comparison_operator_enum',
    nullable: true,
  })
  operator: ComparisonOperator | null;

  @Column({
    name: 'attribute_value',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  attributeValue: number | null;

  @Column({ name: 'is_required', type: 'boolean', default: true })
  isRequired: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  // ======================== RELATIONSHIPS ========================

  /** The badge this requirement belongs to */
  @ManyToOne(() => ORMShopBadge, (badge) => badge.requirements)
  @JoinColumn({ name: 'badge_code', referencedColumnName: 'code' })
  badge: ORMShopBadge;

  /** The document type for document requirements */
  @ManyToOne(() => ORMDocumentType, (docType) => docType.badgeRequirements)
  @JoinColumn({ name: 'document_type_id' })
  documentType: ORMDocumentType;
}

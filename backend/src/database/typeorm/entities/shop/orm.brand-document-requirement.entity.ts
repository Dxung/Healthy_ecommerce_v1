import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ORMBrand } from '../product/orm.brand.entity';
import { ORMDocumentType } from './orm.document-type.entity';

/**
 * ORM Entity for brand_document_requirements table.
 * Admin-configurable document requirements per brand for Official badge applications.
 */
@Entity('brand_document_requirements', { schema: 'shop_schema' })
@Index('idx_brand_doc_requirements_brand_id', ['brandId'])
@Unique('uq_brand_document_requirement', ['brandId', 'documentTypeId'])
export class ORMBrandDocumentRequirement {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'brand_id', type: 'uuid' })
  brandId: string;

  @Column({ name: 'document_type_id', type: 'uuid' })
  documentTypeId: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  // ======================== RELATIONSHIPS ========================

  /** Brand this requirement belongs to */
  @ManyToOne(() => ORMBrand)
  @JoinColumn({ name: 'brand_id' })
  brand: ORMBrand;

  /** Type of document required */
  @ManyToOne(() => ORMDocumentType)
  @JoinColumn({ name: 'document_type_id' })
  documentType: ORMDocumentType;
}

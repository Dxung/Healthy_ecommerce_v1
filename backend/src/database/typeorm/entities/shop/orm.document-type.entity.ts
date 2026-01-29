import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ORMBadgeRequirement } from './orm.badge-requirement.entity';

/**
 * ORM Entity for document_types table.
 * Represents types of documents that shops can submit for verification.
 */
@Entity('document_types', { schema: 'shop_schema' })
export class ORMDocumentType {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'sample_image_url', type: 'varchar', length: 500, nullable: true })
  sampleImageUrl: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  // ======================== RELATIONSHIPS ========================

  /** Badge requirements that reference this document type */
  @OneToMany(() => ORMBadgeRequirement, (req) => req.documentType)
  badgeRequirements: ORMBadgeRequirement[];
}

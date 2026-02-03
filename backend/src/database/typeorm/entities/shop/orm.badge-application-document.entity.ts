import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { ORMBadgeApplication } from './orm.badge-application.entity';
import { ORMDocumentType } from './orm.document-type.entity';

/**
 * ORM Entity for badge_application_documents table.
 * Stores documents submitted with badge applications.
 */
@Entity('badge_application_documents', { schema: 'shop_schema' })
@Index('idx_badge_app_docs_application_id', ['applicationId'])
export class ORMBadgeApplicationDocument {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'application_id', type: 'uuid' })
  applicationId: string;

  @Column({ name: 'document_type_id', type: 'uuid' })
  documentTypeId: string;

  @Column({ name: 'image_url', type: 'varchar', length: 500 })
  imageUrl: string;

  /** Expiration date of the document (null = permanent/no expiry) */
  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  // ======================== RELATIONSHIPS ========================

  /** Badge application this document belongs to */
  @ManyToOne(() => ORMBadgeApplication, (app) => app.documents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'application_id' })
  application: ORMBadgeApplication;

  /** Type of document */
  @ManyToOne(() => ORMDocumentType)
  @JoinColumn({ name: 'document_type_id' })
  documentType: ORMDocumentType;
}

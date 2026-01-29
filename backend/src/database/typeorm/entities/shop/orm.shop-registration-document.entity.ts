import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ORMShopRegistrationRequest } from './orm.shop-registration-request.entity';

/**
 * Entity representing a business document uploaded during shop registration.
 * Used for applying for "approved" badge during registration.
 */
@Entity('shop_registration_documents', { schema: 'shop_schema' })
export class ORMShopRegistrationDocument {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'registration_id', type: 'uuid' })
  registrationId: string;

  @Column({ name: 'document_type_id', type: 'uuid' })
  documentTypeId: string;

  @Column({ name: 'image_url', type: 'varchar', length: 500 })
  imageUrl: string;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  // Relationships
  @ManyToOne(() => ORMShopRegistrationRequest, (reg) => reg.documents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'registration_id' })
  registration: ORMShopRegistrationRequest;
}

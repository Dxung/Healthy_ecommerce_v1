import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

/**
 * ORM Entity for brands table.
 * Represents product brands/manufacturers.
 */
@Entity('brands', { schema: 'brand_schema' })
@Index('idx_brands_slug', ['slug'])
export class ORMBrand {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  // Note: Unique constraint is handled by partial index at DB level
  // CREATE UNIQUE INDEX idx_brands_slug_unique ON brand_schema.brands(slug) WHERE deleted_at IS NULL;
  @Column({ name: 'slug', type: 'varchar', length: 255 })
  slug: string;

  @Column({ name: 'logo_url', type: 'varchar', length: 500, nullable: true })
  logoUrl: string | null;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;
}

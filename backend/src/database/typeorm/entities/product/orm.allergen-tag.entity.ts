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
 * ORM Entity for allergen_tags table.
 * Admin-managed allergen categories (e.g., Nuts, Dairy, Gluten).
 */
@Entity('allergen_tags', { schema: 'product_schema' })
@Index('idx_allergen_tags_slug', ['slug'])
@Index('idx_allergen_tags_is_active', ['isActive'])
export class ORMAllergenTag {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  // Note: Unique constraint is handled by partial index at DB level
  // CREATE UNIQUE INDEX idx_allergen_tags_slug_unique ON product_schema.allergen_tags(slug) WHERE deleted_at IS NULL;
  @Column({ name: 'slug', type: 'varchar', length: 100 })
  slug: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'icon_url', type: 'varchar', length: 500, nullable: true })
  iconUrl: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;
}

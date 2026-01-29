import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';

/**
 * ORM Entity for categories table.
 * Supports 3-level hierarchy via parent_id self-reference.
 */
@Entity('categories', { schema: 'product_schema' })
@Index('idx_categories_parent_id', ['parentId'])
@Index('idx_categories_slug', ['slug'])
export class ORMCategory {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parentId: string | null;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'slug', type: 'varchar', length: 255 })
  slug: string;

  @Column({ name: 'icon_url', type: 'varchar', length: 500, nullable: true })
  iconUrl: string | null;

  @Column({ name: 'level', type: 'smallint' })
  level: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'sort_order', type: 'integer', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  // ======================== RELATIONSHIPS ========================

  /** Parent category (for hierarchy) */
  @ManyToOne(() => ORMCategory, (category) => category.children, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parent_id' })
  parent: ORMCategory | null;

  /** Child categories */
  @OneToMany(() => ORMCategory, (category) => category.parent)
  children: ORMCategory[];
}

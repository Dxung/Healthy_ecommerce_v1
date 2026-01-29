  CREATE TABLE product_schema.diet_tags (
      id UUID PRIMARY KEY DEFAULT uuidv7(),
      name VARCHAR(100) NOT NULL,
      slug VARCHAR(100) NOT NULL,  -- Unique constraint handled by partial index
      description TEXT,
      icon_url VARCHAR(500),
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP NULL     -- For soft delete
  );

  -- Partial unique index: slug unique only when not deleted
  CREATE UNIQUE INDEX idx_diet_tags_slug_unique ON product_schema.diet_tags(slug) WHERE deleted_at IS NULL;

  -- Regular indexes
  CREATE INDEX idx_diet_tags_slug ON product_schema.diet_tags(slug);
  CREATE INDEX idx_diet_tags_is_active ON product_schema.diet_tags(is_active);
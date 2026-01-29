  CREATE TABLE product_schema.categories (
      id UUID PRIMARY KEY DEFAULT uuidv7(),
      parent_id UUID REFERENCES product_schema.categories(id),
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL,
      icon_url VARCHAR(500),
      level SMALLINT NOT NULL CHECK (level BETWEEN 1 AND 3),
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP
  );

  CREATE INDEX idx_categories_parent_id ON product_schema.categories(parent_id);

  CREATE UNIQUE INDEX idx_categories_slug_active
  ON product_schema.categories (slug)
  WHERE deleted_at IS NULL;


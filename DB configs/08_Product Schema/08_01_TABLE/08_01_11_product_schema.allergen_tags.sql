 CREATE TABLE product_schema.allergen_tags (
      id UUID PRIMARY KEY DEFAULT uuidv7(),
      name VARCHAR(100) NOT NULL,
      slug VARCHAR(100) UNIQUE NOT NULL,
      description TEXT,
      icon_url VARCHAR(500),
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX idx_allergen_tags_slug ON product_schema.allergen_tags(slug);
  CREATE INDEX idx_allergen_tags_is_active ON product_schema.allergen_tags(is_active);
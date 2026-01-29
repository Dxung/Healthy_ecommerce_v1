 CREATE TABLE product_schema.diet_tags (
      id UUID PRIMARY KEY DEFAULT uuidv7(),
      name VARCHAR(100) NOT NULL,
      slug VARCHAR(100) UNIQUE NOT NULL,
      description TEXT,
      icon_url VARCHAR(500),
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX idx_diet_tags_slug ON product_schema.diet_tags(slug);
  CREATE INDEX idx_diet_tags_is_active ON product_schema.diet_tags(is_active);
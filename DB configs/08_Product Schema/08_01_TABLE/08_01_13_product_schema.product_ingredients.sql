CREATE TABLE product_schema.product_ingredients (
      id UUID PRIMARY KEY DEFAULT uuidv7(),
      product_id UUID NOT NULL REFERENCES product_schema.products(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      CONSTRAINT uq_product_ingredient_name UNIQUE(product_id, name)
  );

  CREATE INDEX idx_product_ingredients_product_id ON product_schema.product_ingredients(product_id);
  CREATE INDEX idx_product_ingredients_name ON product_schema.product_ingredients(name);
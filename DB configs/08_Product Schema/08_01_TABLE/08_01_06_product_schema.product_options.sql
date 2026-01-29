  CREATE TABLE product_schema.product_options (
      id UUID PRIMARY KEY DEFAULT uuidv7(),
      product_id UUID NOT NULL REFERENCES product_schema.products(id) ON DELETE CASCADE,
      name VARCHAR(100) NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT uq_product_option_name UNIQUE(product_id, name)
  );

  CREATE INDEX idx_product_options_product_id ON product_schema.product_options(product_id);
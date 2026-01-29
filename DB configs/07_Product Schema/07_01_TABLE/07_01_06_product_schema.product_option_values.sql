  CREATE TABLE product_schema.product_option_values (
      id UUID PRIMARY KEY DEFAULT uuidv7(),
      option_id UUID NOT NULL REFERENCES product_schema.product_options(id) ON DELETE CASCADE,
      value VARCHAR(100) NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT uq_option_value UNIQUE(option_id, value)
  );

  CREATE INDEX idx_product_option_values_option_id ON product_schema.product_option_values(option_id);